import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { _appFetch } from '../../api/app.fetch';
import { NanopubProfile } from '../../shared/types/types.nanopubs';
import { NotificationFreq } from '../../shared/types/types.notifications';
import { OrcidProfile } from '../../shared/types/types.orcid';
import {
  ALL_PUBLISH_PLATFORMS,
  ALL_SOURCE_PLATFORMS,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../../shared/types/types.platforms';
import { PlatformProfile } from '../../shared/types/types.profiles';
import {
  AppUserRead,
  AutopostOption,
  EmailDetails,
} from '../../shared/types/types.user';
import { usePersist } from '../../utils/use.persist';

const DEBUG = true;

export const OUR_TOKEN_NAME = 'ourToken';
export const LOGIN_STATUS = 'loginStatus';
export const PLATFORMS_LOGIN_STATUS = 'platformsLoginStatus';
export const ALREADY_CONNECTED_KEY = 'already-connected';

export type AccountContextType = {
  connectedUser?: ConnectedUser;
  connectedSourcePlatforms: PUBLISHABLE_PLATFORM[];
  isConnected: boolean;
  email?: EmailDetails;
  disconnect: () => void;
  refresh: () => void;
  token?: string;
  setToken: (token: string) => void;
  setOverallLoginStatus: (status: OverallLoginStatus) => void;
  overallLoginStatus: OverallLoginStatus | undefined;
  setLoginFlowState: (status: LoginFlowState) => void;
  loginFlowState: LoginFlowState;
  resetLogin: () => void;
  currentAutopost?: AutopostOption;
  currentNotifications?: NotificationFreq;
  setPlatformConnectedStatus: (
    platform: PLATFORM,
    status: PlatformConnectedStatus
  ) => void;
  getPlatformConnectedStatus: (
    platformId: PLATFORM
  ) => PlatformConnectedStatus | undefined;
  alreadyConnected?: boolean;
  setAlreadyConnected: (value: boolean) => void;
};

const AccountContextValue = createContext<AccountContextType | undefined>(
  undefined
);

// assume one profile per platform for now
export interface ConnectedUser extends Omit<AppUserRead, 'profiles'> {
  profiles?: {
    [PLATFORM.Orcid]?: OrcidProfile;
    [PLATFORM.Twitter]?: PlatformProfile;
    [PLATFORM.Nanopub]?: NanopubProfile;
    [PLATFORM.Mastodon]?: PlatformProfile;
    [PLATFORM.Bluesky]?: PlatformProfile;
  };
}

/** explicit status of the login/signup process */
export enum LoginFlowState {
  Idle = 'Idle',
  ConnectingSigner = 'ConnectingSigner',
  ComputingAddress = 'ComputingAddress',
  ComputingRSAKeys = 'ComputingsRSAKeys',
  CreatingEthSignature = 'CreatingEthSignature',
  SignningUpNanopub = 'SignningUpNanopub',
  RegisteringEmail = 'RegisteringEmail',
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
  PartialLoggedIn = 'PartialLoggedIn',
  FullyLoggedIn = 'FullyLoggedIn',
}

export enum PlatformConnectedStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
}

export type PlatformsConnectedStatus = Partial<
  Record<PLATFORM, PlatformConnectedStatus>
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

  const [alreadyConnected, setAlreadyConnected] = usePersist(
    ALREADY_CONNECTED_KEY,
    false
  );

  /** keep the conneccted user linkted to the current token */
  useEffect(() => {
    refresh();
  }, [token]);

  const setOverallLoginStatus = (status: OverallLoginStatus) => {
    if (DEBUG) console.log('setOverallLoginStatus', status);
    _setOverallLoginStatus(status);
  };

  const setLoginFlowState = (status: LoginFlowState) => {
    if (DEBUG) console.log('setLoginFlowState', status);
    _setLoginFlowState(status);
  };

  const resetLogin = () => {
    setLoginFlowState(LoginFlowState.Idle);
    setOverallLoginStatus(OverallLoginStatus.NotKnown);
  };

  const refresh = async () => {
    try {
      if (token) {
        if (DEBUG) console.log('getting me', { token });
        const user = await _appFetch<AppUserRead>('/api/auth/me', {}, token);
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
              nanopub:
                user.profiles[PLATFORM.Nanopub] &&
                user.profiles[PLATFORM.Nanopub][0].profile,
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
        setConnectedUser(null);
      }
    } catch (e) {
      setToken(null);
    }
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
    if (connectedUser && connectedUser.email) {
      /** if not a single source platform has been connected, consider login partial */
      if (
        !ALL_SOURCE_PLATFORMS.some((platformId: PUBLISHABLE_PLATFORM) => {
          return (
            connectedUser.profiles &&
            connectedUser.profiles[platformId] !== undefined
          );
        })
      ) {
        setOverallLoginStatus(OverallLoginStatus.PartialLoggedIn);
      } else {
        setOverallLoginStatus(OverallLoginStatus.FullyLoggedIn);
      }

      /** update each platform persisted connected status */
      ALL_PUBLISH_PLATFORMS.forEach((platform) => {
        if (
          connectedUser.profiles &&
          connectedUser.profiles[platform] &&
          loginFlowState !== LoginFlowState.Disconnecting
        ) {
          setPlatformsConnectedStatus({
            ...platformsConnectedStatus,
            [platform]: PlatformConnectedStatus.Connected,
          });
        }
      });
    }

    /** If finished fetching for connected user and is undefined, then
     * the status is not not-known, its a confirmed LoggedOut */
    if (
      overallLoginStatus === OverallLoginStatus.NotKnown &&
      connectedUser === undefined
    ) {
      disconnect();
    }
  }, [connectedUser, overallLoginStatus, token, loginFlowState]);

  const disconnect = () => {
    setConnectedUser(undefined);
    setToken(null);

    ALL_PUBLISH_PLATFORMS.forEach((platform) => {
      setPlatformsConnectedStatus({
        ...platformsConnectedStatus,
        [platform]: PlatformConnectedStatus.Disconnected,
      });
    });

    _setLoginFlowState(LoginFlowState.Idle);
    _setOverallLoginStatus(OverallLoginStatus.LoggedOut);
  };

  const currentAutopost =
    connectedUser?.settings?.autopost[PLATFORM.Nanopub].value;

  const currentNotifications = connectedUser?.settings?.notificationFreq;

  const email = connectedUser ? connectedUser.email : undefined;

  const setPlatformConnectedStatus = (
    platformId: PLATFORM,
    status: PlatformConnectedStatus
  ) => {
    setPlatformsConnectedStatus({
      ...platformsConnectedStatus,
      [platformId]: status,
    });
  };

  const getPlatformConnectedStatus = (
    platformId: PLATFORM
  ): PlatformConnectedStatus | undefined => {
    return platformsConnectedStatus && platformsConnectedStatus[platformId];
  };

  const connectedSourcePlatforms = useMemo(() => {
    return ALL_SOURCE_PLATFORMS.filter((platform) => {
      const profiles = connectedUser?.profiles;
      const profile = profiles && profiles[platform];
      return profile !== undefined;
    });
  }, [connectedUser]);

  useEffect(() => {
    connectedSourcePlatforms.forEach((platform) => {
      setPlatformConnectedStatus(platform, PlatformConnectedStatus.Connected);
    });
  }, [connectedSourcePlatforms]);

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        connectedSourcePlatforms,
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
        currentAutopost,
        currentNotifications,
        setPlatformConnectedStatus,
        getPlatformConnectedStatus,
        alreadyConnected,
        setAlreadyConnected,
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
