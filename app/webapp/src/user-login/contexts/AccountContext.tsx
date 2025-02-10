import { useAuth, useUser } from '@clerk/clerk-react';
import { usePostHog } from 'posthog-js/react';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { _appFetch } from '../../api/app.fetch';
import { NotificationFreq } from '../../shared/types/types.notifications';
import { OrcidProfile } from '../../shared/types/types.orcid';
import {
  ALL_IDENTITY_PLATFORMS,
  ALL_PUBLISH_PLATFORMS,
  ALL_SOURCE_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
} from '../../shared/types/types.platforms';
import { PlatformProfile } from '../../shared/types/types.profiles';
import {
  AccountDetailsRead,
  AppUserRead,
  EmailDetails,
} from '../../shared/types/types.user';
import { HIDE_SHARE_INFO } from '../../user-home/UserPostsFeed';
import { usePersist } from '../../utils/use.persist';

const DEBUG = true;

export const PLATFORMS_LOGIN_STATUS = 'platformsLoginStatus';
export const ALREADY_CONNECTED_KEY = 'already-connected';

export type AccountContextType = {
  connectedUser?: ConnectedUser;
  connectedPlatforms: IDENTITY_PLATFORM[];
  isConnected: boolean;
  hasDisconnectedAccount?: boolean;
  disconnectedAccounts: IDENTITY_PLATFORM[];
  email?: EmailDetails;
  disconnect: () => void;
  refresh: () => Promise<void>;
  token?: string | null;
  setToken: (token: string) => void;
  setLoginFlowState: (status: LoginFlowState) => void;
  loginFlowState: LoginFlowState;
  currentNotifications?: NotificationFreq;
  setPlatformConnectedStatus: (
    platform: IDENTITY_PLATFORM,
    status: PlatformConnectedStatus
  ) => void;
  getPlatformConnectedStatus: (
    platformId: IDENTITY_PLATFORM
  ) => PlatformConnectedStatus | undefined | null;
};

const AccountContextValue = createContext<AccountContextType | undefined>(
  undefined
);

// assume one profile per platform for now
export interface ConnectedUser extends Omit<AppUserRead, 'profiles'> {
  profiles?: {
    [PLATFORM.Orcid]?: AccountDetailsRead<OrcidProfile>;
    [PLATFORM.Twitter]?: AccountDetailsRead<PlatformProfile>;
    [PLATFORM.Mastodon]?: AccountDetailsRead<PlatformProfile>;
    [PLATFORM.Bluesky]?: AccountDetailsRead<PlatformProfile>;
  };
}

// export type ConnectedUser = AppUserRead;

/** explicit status of the login/signup process */
export enum LoginFlowState {
  Idle = 'Idle',
  ConnectingTwitter = 'ConnectingTwitter',
  ConnectingMastodon = 'ConnectingMastodon',
  ConnectingBluesky = 'ConnectingBluesky',
  BasicLoggedIn = 'BasicLoggedIn',
  Disconnecting = 'Disconnecting',
}

/** higher level status of the login flow. Persisted in localStorage helps
 * make sense of the LoginFlowState on different situations
 */
export enum OverallLoginStatus {
  NotKnown = 'NotKnown', // init value before we check localStorage
  LoggedOut = 'LoggedOut',
  LogginIn = 'LogginIn',
  FullyLoggedIn = 'FullyLoggedIn',
}

export enum PlatformConnectedStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  ReconnectRequired = 'ReconnectRequired',
}

export type PlatformsConnectedStatus = Partial<
  Record<IDENTITY_PLATFORM, PlatformConnectedStatus>
>;

const platformsConnectedStatusInit: PlatformsConnectedStatus = {};
ALL_PUBLISH_PLATFORMS.forEach((platform) => {
  platformsConnectedStatusInit[platform] = PlatformConnectedStatus.Disconnected;
});

/**
 * Manages the logged-in user. We use JWT tokens to authenticate
 * a logged in user to our backend. The JWT is set when the user
 * logsin or sign up with any supported platform, and is stored
 * in the localStorage
 */
export const AccountContext = (props: PropsWithChildren) => {
  /** clark does its things, then isSignedIn is tru, we call getToken, then token is defined,
   * we refresh connected user (the backend will create the user in our DB, if the user does not exist)
   */

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { isSignedIn } = useUser();
  const { getToken, signOut } = useAuth();

  const [token, setToken] = useState<string>();

  useEffect(() => {
    if (isSignedIn) {
      getToken()
        .then((token) => {
          if (token) {
            setToken(token);
          }
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, isSignedIn]);

  const [connectedUser, setConnectedUser] = useState<ConnectedUser | null>();

  const [loginFlowState, _setLoginFlowState] = useState<LoginFlowState>(
    LoginFlowState.Idle
  );

  const [platformsConnectedStatus, setPlatformsConnectedStatus] =
    usePersist<PlatformsConnectedStatus>(
      PLATFORMS_LOGIN_STATUS,
      platformsConnectedStatusInit
    );

  const [, setHideShareInfo] = usePersist<boolean>(HIDE_SHARE_INFO, false);
  const posthog = usePostHog();
  const identifiedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      if (token) {
        if (DEBUG) console.log('getting me', { token });
        const user = await _appFetch<AppUserRead>(
          '/api/auth/me',
          {},
          true,
          token
        );
        if (DEBUG) console.log('set connectedUser after fetch', { user });

        /** extract the profile of each platform for convenience */
        const profiles = ((): ConnectedUser['profiles'] => {
          if (user.profiles) {
            return {
              twitter:
                user.profiles[PLATFORM.Twitter] &&
                user.profiles[PLATFORM.Twitter][0],
              mastodon:
                user.profiles[PLATFORM.Mastodon] &&
                user.profiles[PLATFORM.Mastodon][0],
              orcid:
                user.profiles[PLATFORM.Orcid] &&
                user.profiles[PLATFORM.Orcid][0],
              bluesky:
                user.profiles[PLATFORM.Bluesky] &&
                user.profiles[PLATFORM.Bluesky][0],
            };
          }
          return {};
        })();

        /** set user */
        setConnectedUser({ ...user, profiles });
      }
    } catch (e) {
      signOut().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setToken, token]);

  /** keep the conneccted user linkted to the current token */
  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh, token]);

  const setLoginFlowState = (status: LoginFlowState) => {
    if (DEBUG) console.log('setLoginFlowState', status);
    _setLoginFlowState(status);
  };

  /**
   * logged in status is strictly linked to the connected user,
   * this should be the only place on the app where the status is set to loggedIn
   */
  useEffect(() => {
    if (DEBUG)
      console.log('overallStatus update effect', {
        connectedUser,
      });

    const isConnecting =
      ALL_PUBLISH_PLATFORMS.find((platform) => {
        return (
          getPlatformConnectedStatus(platform) ===
          PlatformConnectedStatus.Connecting
        );
      }) !== undefined;

    if (connectedUser === null && !isConnecting) {
      disconnect();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedUser, token, loginFlowState]);

  const disconnect = () => {
    if (DEBUG) console.log(`disconnect called`);

    signOut().catch(console.error);
    setConnectedUser(undefined);

    const disabledStatus: PlatformsConnectedStatus = {};

    ALL_PUBLISH_PLATFORMS.forEach((platform) => {
      disabledStatus[platform] = PlatformConnectedStatus.Disconnected;
    });

    setPlatformsConnectedStatus({
      ...disabledStatus,
    });

    setHideShareInfo(null);
    _setLoginFlowState(LoginFlowState.Idle);
    posthog?.reset();
  };

  const email = connectedUser ? connectedUser.email : undefined;

  const setPlatformConnectedStatus = (
    platformId: PLATFORM,
    status: PlatformConnectedStatus
  ) => {
    if (DEBUG)
      console.log(
        `setting PlatformsConnectedStatus platformId ${platformId} status ${status}`
      );
    setPlatformsConnectedStatus({
      ...platformsConnectedStatus,
      [platformId]: status,
    });
  };

  const getPlatformConnectedStatus = (
    platformId: IDENTITY_PLATFORM
  ): PlatformConnectedStatus | undefined | null => {
    return platformsConnectedStatus && platformsConnectedStatus[platformId];
  };

  const connectedPlatforms = useMemo(() => {
    return ALL_IDENTITY_PLATFORMS.filter((platform) => {
      const profiles = connectedUser?.profiles;
      const profile = profiles && profiles[platform];
      return profile !== undefined;
    });
  }, [connectedUser]);

  /** single place where a connecting platform is marked as connected */
  useEffect(() => {
    if (connectedUser) {
      let modified = false;
      const newConnectedStatus = { ...platformsConnectedStatus };

      ALL_IDENTITY_PLATFORMS.forEach((platform) => {
        const profile = connectedUser.profiles?.[platform];
        if (profile?.isDisconnected) {
          if (
            getPlatformConnectedStatus(platform) !==
              PlatformConnectedStatus.ReconnectRequired &&
            getPlatformConnectedStatus(platform) !==
              PlatformConnectedStatus.Connecting
          ) {
            newConnectedStatus[platform] =
              PlatformConnectedStatus.ReconnectRequired;
            modified = true;
          }
        } else if (
          getPlatformConnectedStatus(platform) !==
            PlatformConnectedStatus.Connected &&
          connectedPlatforms.includes(platform)
        ) {
          newConnectedStatus[platform] = PlatformConnectedStatus.Connected;
          modified = true;
        }
      });

      if (modified) {
        setPlatformsConnectedStatus(newConnectedStatus);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedPlatforms, connectedUser, platformsConnectedStatus]);

  useEffect(() => {
    let username = undefined;
    if (connectedUser?.profiles) {
      for (const platform of ALL_SOURCE_PLATFORMS) {
        if (connectedUser.profiles[platform]) {
          username = connectedUser.profiles[platform]?.profile.username;
          break;
        }
      }
    }

    if (connectedUser && username && !identifiedRef.current) {
      posthog?.identify(connectedUser.userId, {
        username,
        userId: connectedUser.userId,
      });
      identifiedRef.current = true;
    }
  }, [connectedUser, posthog]);

  const disconnectedAccounts = Object.entries(connectedUser?.profiles || {})
    .filter(([platform, account]) => {
      return platform !== PLATFORM.Orcid && account?.isDisconnected;
    })
    .map(([platform]) => {
      return platform as IDENTITY_PLATFORM;
    });

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        connectedPlatforms,
        email,
        isConnected: connectedUser !== undefined && connectedUser !== null,
        hasDisconnectedAccount: disconnectedAccounts.length > 0,
        disconnectedAccounts,
        disconnect,
        refresh,
        token,
        setToken,
        loginFlowState,
        setLoginFlowState,
        setPlatformConnectedStatus,
        getPlatformConnectedStatus,
      }}>
      {props.children}
    </AccountContextValue.Provider>
  );
};

export const useAccountContext = (): AccountContextType => {
  const context = useContext(AccountContextValue);
  if (!context) throw Error('context not found');
  return context;
};
