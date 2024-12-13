import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { _appFetch } from '../../api/app.fetch';
import { NotificationFreq } from '../../shared/types/types.notifications';
import { OrcidProfile } from '../../shared/types/types.orcid';
import {
  ALL_IDENTITY_PLATFORMS,
  ALL_PUBLISH_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
} from '../../shared/types/types.platforms';
import { PlatformProfile } from '../../shared/types/types.profiles';
import { AppUserRead, EmailDetails } from '../../shared/types/types.user';
import { HIDE_SHARE_INFO } from '../../user-home/UserPostsFeed';
import { usePersist } from '../../utils/use.persist';

const DEBUG = false;

export const OUR_TOKEN_NAME = 'ourToken';
export const LOGIN_STATUS = 'loginStatus';
export const PLATFORMS_LOGIN_STATUS = 'platformsLoginStatus';
export const ALREADY_CONNECTED_KEY = 'already-connected';

export type AccountContextType = {
  connectedUser?: ConnectedUser;
  connectedPlatforms: IDENTITY_PLATFORM[];
  isConnected: boolean;
  email?: EmailDetails;
  disconnect: () => void;
  refresh: () => Promise<void>;
  token?: string | null;
  setToken: (token: string) => void;
  setOverallLoginStatus: (status: OverallLoginStatus) => void;
  overallLoginStatus: OverallLoginStatus | undefined | null;
  setLoginFlowState: (status: LoginFlowState) => void;
  loginFlowState: LoginFlowState;
  resetLogin: () => void;
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
    [PLATFORM.Orcid]?: OrcidProfile;
    [PLATFORM.Twitter]?: PlatformProfile;
    [PLATFORM.Mastodon]?: PlatformProfile;
    [PLATFORM.Bluesky]?: PlatformProfile;
  };
}

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
  const [connectedUser, setConnectedUser] = useState<ConnectedUser | null>();

  const [loginFlowState, _setLoginFlowState] = useState<LoginFlowState>(
    LoginFlowState.Idle
  );

  const [token, setToken] = usePersist<string>(OUR_TOKEN_NAME, null);
  const [overallLoginStatus, _setOverallLoginStatus] =
    usePersist<OverallLoginStatus>(LOGIN_STATUS, OverallLoginStatus.NotKnown);

  const [platformsConnectedStatus, setPlatformsConnectedStatus] =
    usePersist<PlatformsConnectedStatus>(
      PLATFORMS_LOGIN_STATUS,
      platformsConnectedStatusInit
    );

  const [, setHideShareInfo] = usePersist<boolean>(HIDE_SHARE_INFO, false);

  const setOverallLoginStatus = useCallback(
    (status: OverallLoginStatus) => {
      if (DEBUG) console.log('setOverallLoginStatus', status);
      _setOverallLoginStatus(status);
    },
    [_setOverallLoginStatus]
  );

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
                user.profiles[PLATFORM.Twitter][0].profile,
              mastodon:
                user.profiles[PLATFORM.Mastodon] &&
                user.profiles[PLATFORM.Mastodon][0].profile,
              orcid:
                user.profiles[PLATFORM.Orcid] &&
                user.profiles[PLATFORM.Orcid][0].profile,
              bluesky:
                user.profiles[PLATFORM.Bluesky] &&
                user.profiles[PLATFORM.Bluesky][0].profile,
            };
          }
          return {};
        })();

        /** set user */
        setConnectedUser({ ...user, profiles });
      } else {
        if (DEBUG) console.log('setting connected user as null');
        setOverallLoginStatus(OverallLoginStatus.LoggedOut);
        setConnectedUser(null);
      }
    } catch (e) {
      setOverallLoginStatus(OverallLoginStatus.LoggedOut);
      setToken(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOverallLoginStatus, setToken, token]);

  /** keep the conneccted user linkted to the current token */
  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh, token]);

  const setLoginFlowState = (status: LoginFlowState) => {
    if (DEBUG) console.log('setLoginFlowState', status);
    _setLoginFlowState(status);
  };

  const resetLogin = () => {
    setLoginFlowState(LoginFlowState.Idle);
    setOverallLoginStatus(OverallLoginStatus.NotKnown);
  };

  /**
   * logged in status is strictly linked to the connected user,
   * this should be the only place on the app where the status is set to loggedIn
   */
  useEffect(() => {
    if (DEBUG)
      console.log('overallStatus update effect', {
        connectedUser,
        overallLoginStatus,
      });

    /**
     * once connected user is defined and has an email, but there is no
     * twitter, the user is partially logged in
     */
    if (connectedUser) {
      /** connectedUser === loggedIn now */
      setOverallLoginStatus(OverallLoginStatus.FullyLoggedIn);
    }

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
  }, [
    connectedUser,
    overallLoginStatus,
    token,
    loginFlowState,
    setOverallLoginStatus,
  ]);

  const disconnect = () => {
    if (DEBUG) console.log(`disconnect called`);

    setConnectedUser(undefined);
    setToken(null);

    const disabledStatus: PlatformsConnectedStatus = {};

    ALL_PUBLISH_PLATFORMS.forEach((platform) => {
      disabledStatus[platform] = PlatformConnectedStatus.Disconnected;
    });

    setPlatformsConnectedStatus({
      ...disabledStatus,
    });

    setHideShareInfo(null);
    _setLoginFlowState(LoginFlowState.Idle);
    _setOverallLoginStatus(OverallLoginStatus.LoggedOut);
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
        if (
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

      /** protection in case a logged user remains without accounts (beacuse of a hard account reset) */
      if (connectedPlatforms.length === 0) {
        disconnect();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedPlatforms, connectedUser, platformsConnectedStatus]);

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        connectedPlatforms,
        email,
        isConnected: connectedUser !== undefined && connectedUser !== null,
        disconnect,
        refresh,
        token,
        setToken,
        setOverallLoginStatus,
        overallLoginStatus,
        loginFlowState,
        setLoginFlowState,
        resetLogin,
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
