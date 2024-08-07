import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { _appFetch } from '../../api/app.fetch';
import { OrcidUserProfile } from '../../shared/types/types.orcid';
import { TwitterUserProfile } from '../../shared/types/types.twitter';
import {
  AppUserRead,
  EmailDetails,
  PLATFORM,
} from '../../shared/types/types.user';
import { usePersist } from '../../utils/use.persist';
import { getAccount } from '../user.helper';

const DEBUG = false;

export const OUR_TOKEN_NAME = 'ourToken';
export const LOGIN_STATUS = 'loginStatus';
export const TWITTER_LOGIN_STATUS = 'twitterLoginStatus';

export type AccountContextType = {
  connectedUser?: AppUserRead;
  isConnected: boolean;
  twitterProfile?: TwitterUserProfile;
  email?: EmailDetails;
  disconnect: () => void;
  refresh: () => void;
  token?: string;
  setToken: (token: string) => void;
  setOverallLoginStatus: (status: OverallLoginStatus) => void;
  overallLoginStatus: OverallLoginStatus | undefined;
  setLoginFlowState: (status: LoginFlowState) => void;
  loginFlowState: LoginFlowState;
  setTwitterConnectedStatus: (status: TwitterConnectedStatus) => void;
  twitterConnectedStatus: TwitterConnectedStatus | undefined;
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

  const refresh = async () => {
    try {
      if (token) {
        if (DEBUG) console.log('getting me', { token });
        const user = await _appFetch<AppUserRead>('/api/auth/me', {}, token);
        if (DEBUG) console.log('got connected user me', { user });
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

    if (connectedUser && connectedUser.email && !twitterProfile) {
      setOverallLoginStatus(OverallLoginStatus.PartialLoggedIn);
      return;
    }

    if (
      connectedUser &&
      connectedUser.email &&
      twitterProfile &&
      loginFlowState !== LoginFlowState.Disconnecting
    ) {
      setTwitterConnectedStatus(TwitterConnectedStatus.Connected);
      setOverallLoginStatus(OverallLoginStatus.FullyLoggedIn);
      return;
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
  }, [connectedUser, overallLoginStatus, token]);

  const disconnect = () => {
    setConnectedUser(undefined);
    setToken(null);
  };

  const twitterProfile = connectedUser
    ? getAccount(connectedUser, PLATFORM.Twitter)?.profile
    : undefined;

  const orcidProfile = connectedUser
    ? getAccount(connectedUser, PLATFORM.Orcid)?.profile
    : undefined;

  const email = connectedUser ? connectedUser.email : undefined;

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        twitterProfile,
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
        setTwitterConnectedStatus,
        twitterConnectedStatus,
        orcidProfile,
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
