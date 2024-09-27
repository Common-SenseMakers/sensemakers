import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { _appFetch } from '../../api/app.fetch';
import { BlueskyUserProfile } from '../../shared/types/types.bluesky';
import { MastodonUserProfile } from '../../shared/types/types.mastodon';
import { NotificationFreq } from '../../shared/types/types.notifications';
import { OrcidUserProfile } from '../../shared/types/types.orcid';
import { TwitterUserProfile } from '../../shared/types/types.twitter';
import {
  AccountDetailsRead,
  AppUserRead,
  AutopostOption,
  EmailDetails,
  PLATFORM,
} from '../../shared/types/types.user';
import { usePersist } from '../../utils/use.persist';
import { getAccount } from '../user.helper';

const DEBUG = true;

export const OUR_TOKEN_NAME = 'ourToken';
export const LOGIN_STATUS = 'loginStatus';
export const TWITTER_LOGIN_STATUS = 'twitterLoginStatus';

export type AccountContextType = {
  connectedUser?: AppUserRead;
  isConnected: boolean;
  twitterProfile?: TwitterUserProfile;
  mastodonProfile?: MastodonUserProfile;
  blueskyProfile?: BlueskyUserProfile;
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
  setTwitterConnectedStatus: (status: TwitterConnectedStatus) => void;
  twitterConnectedStatus: TwitterConnectedStatus | undefined;
  orcid?: AccountDetailsRead<OrcidUserProfile>;
  currentAutopost?: AutopostOption;
  currentNotifications?: NotificationFreq;
  setMastodonConnectedStatus: (status: MastodonConnectedStatus) => void;
  mastodonConnectedStatus: MastodonConnectedStatus | undefined;
  setBlueskyConnectedStatus: (status: BlueskyConnectedStatus) => void;
  blueskyConnectedStatus: BlueskyConnectedStatus | undefined;
  orcidProfile?: OrcidUserProfile;
};

const AccountContextValue = createContext<AccountContextType | undefined>(
  undefined
);

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

export enum TwitterConnectedStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
}

export enum MastodonConnectedStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
}

export enum BlueskyConnectedStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
}

/**
 * Manages the logged-in user. We use JWT tokens to authenticate
 * a logged in user to our backend. The JWT is set when the user
 * logsin or sign up with any supported platform, and is stored
 * in the localStorage
 */
export const AccountContext = (props: PropsWithChildren) => {
  const [connectedUser, setConnectedUser] = useState<AppUserRead | null>();

  const [loginFlowState, _setLoginFlowState] = useState<LoginFlowState>(
    LoginFlowState.Idle
  );

  const [token, setToken] = usePersist<string>(OUR_TOKEN_NAME, null);
  const [overallLoginStatus, _setOverallLoginStatus] =
    usePersist<OverallLoginStatus>(LOGIN_STATUS, OverallLoginStatus.NotKnown);

  const [twitterConnectedStatus, setTwitterConnectedStatus] =
    usePersist<TwitterConnectedStatus>(
      TWITTER_LOGIN_STATUS,
      TwitterConnectedStatus.Disconnected
    );

  const [mastodonConnectedStatus, setMastodonConnectedStatus] =
    usePersist<MastodonConnectedStatus>(
      'MASTODON_LOGIN_STATUS',
      MastodonConnectedStatus.Disconnected
    );

  const [blueskyConnectedStatus, setBlueskyConnectedStatus] =
    usePersist<BlueskyConnectedStatus>(
      'BLUESKY_LOGIN_STATUS',
      BlueskyConnectedStatus.Disconnected
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
        setConnectedUser(user);
      } else {
        if (DEBUG) console.log('setting connected user as null');
        setConnectedUser(null);
      }
    } catch (e) {
      setToken(null);
    }
  };

  /** logged in status is strictly linked to the connected user,
   * this should be the only place on the app where the status is set to loggedIn
   */
  useEffect(() => {
    if (DEBUG)
      console.log('connectedUser', {
        connectedUser,
        overallLoginStatus,
        twitter: connectedUser?.email,
      });

    if (connectedUser && connectedUser.email) {
      const hasTwitter = !!getAccount(connectedUser, PLATFORM.Twitter);
      const hasMastodon = !!getAccount(connectedUser, PLATFORM.Mastodon);
      const hasBluesky = !!getAccount(connectedUser, PLATFORM.Bluesky);

      if (!hasTwitter && !hasMastodon && !hasBluesky) {
        setOverallLoginStatus(OverallLoginStatus.PartialLoggedIn);
        return;
      }

      if (loginFlowState !== LoginFlowState.Disconnecting) {
        if (hasTwitter) {
          setTwitterConnectedStatus(TwitterConnectedStatus.Connected);
        }
        if (hasMastodon) {
          setMastodonConnectedStatus(MastodonConnectedStatus.Connected);
        }
        if (hasBluesky) {
          setBlueskyConnectedStatus(BlueskyConnectedStatus.Connected);
        }
        // Don't automatically set to FullyLoggedIn here
        // It will be set when the user clicks "Continue" in ConnectSocialsPage
        return;
      }
    }

    if (overallLoginStatus === OverallLoginStatus.NotKnown) {
      setOverallLoginStatus(OverallLoginStatus.LoggedOut);
      return;
    }

    if (
      !token &&
      !connectedUser &&
      overallLoginStatus !== OverallLoginStatus.LogginIn
    ) {
      setOverallLoginStatus(OverallLoginStatus.LoggedOut);
    }
  }, [connectedUser, overallLoginStatus, token, loginFlowState]);

  const disconnect = () => {
    setConnectedUser(undefined);
    setToken(null);
  };

  const twitterProfile = useMemo(() => {
    const profile = connectedUser
      ? getAccount(connectedUser, PLATFORM.Twitter)?.profile
      : undefined;

    if (DEBUG) console.log('twitterProfile', { profile });

    return profile;
  }, [connectedUser]);

  const mastodonProfile = useMemo(() => {
    const profile = connectedUser
      ? getAccount(connectedUser, PLATFORM.Mastodon)?.profile
      : undefined;

    if (DEBUG) console.log('mastodonProfile', { profile });

    return profile;
  }, [connectedUser]);

  const blueskyProfile = useMemo(() => {
    const profile = connectedUser
      ? getAccount(connectedUser, PLATFORM.Bluesky)?.profile
      : undefined;

    if (DEBUG) console.log('blueskyProfile', { profile });

    return profile;
  }, [connectedUser]);

  const orcid = useMemo(() => {
    const profile = connectedUser
      ? getAccount<OrcidUserProfile>(connectedUser, PLATFORM.Orcid)
      : undefined;

    if (DEBUG) console.log('orcidProfile', { profile });

    return profile;
  }, [connectedUser]);

  const currentAutopost =
    connectedUser?.settings?.autopost[PLATFORM.Nanopub].value;

  const currentNotifications = connectedUser?.settings?.notificationFreq;

  const email = connectedUser ? connectedUser.email : undefined;

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        twitterProfile,
        mastodonProfile,
        blueskyProfile,
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
        setTwitterConnectedStatus,
        twitterConnectedStatus,
        orcid,
        currentAutopost,
        currentNotifications,
        setMastodonConnectedStatus,
        mastodonConnectedStatus,
        setBlueskyConnectedStatus,
        blueskyConnectedStatus,
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
