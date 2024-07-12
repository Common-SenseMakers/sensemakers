import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { _appFetch } from '../../api/app.fetch';
import { TwitterUserProfile } from '../../shared/types/types.twitter';
import {
  AppUserRead,
  EmailDetails,
  PLATFORM,
} from '../../shared/types/types.user';
import { usePersist } from '../../utils/local.storage';
import { getAccount } from '../user.helper';

const DEBUG = true;

export const OUR_TOKEN_NAME = 'ourToken';
export const LOGIN_STATUS = 'loginStatus';

export type AccountContextType = {
  connectedUser?: AppUserRead;
  hasTriedFetchingUser: boolean;
  isConnected: boolean;
  twitterProfile?: TwitterUserProfile;
  email?: EmailDetails;
  disconnect: () => void;
  refresh: () => void;
  token?: string;
  setToken: (token: string) => void;
  setLoginStatus: (status: LoginStatus) => void;
  loginStatus: LoginStatus;
};

const AccountContextValue = createContext<AccountContextType | undefined>(
  undefined
);

/** explicit status of the login/signup process (useState persisted in localStorage) */
export enum LoginStatus {
  NotKnown = 'NotKnown', // init value before we check localStorage
  ConnectingSigner = 'ConnectingSigner',
  ComputingAddress = 'ComputingAddress',
  ComputingRSAKeys = 'ComputingsRSAKeys',
  CreatingEthSignature = 'CreatingEthSignature',
  SignningUpNanopub = 'SignningUpNanopub',
  RegisteringEmail = 'RegisteringEmail',
  ConnectingTwitter = 'ConnectingTwitter',
  BasicLoggedIn = 'BasicLoggedIn',
  FullyLoggedIn = 'FullyLoggedIn',
  FullyLoggedOut = 'FullyLoggedOut',
}

/**
 * Manages the logged-in user. We use JWT tokens to authenticate
 * a logged in user to our backend. The JWT is set when the user
 * logsin or sign up with any supported platform, and is stored
 * in the localStorage
 */
export const AccountContext = (props: PropsWithChildren) => {
  const [connectedUser, setConnectedUser] = useState<AppUserRead | null>();
  const [hasTriedFetchingUser, setHasTriedFetchingUser] =
    useState<boolean>(false);

  const [token, setToken] = usePersist<string>(OUR_TOKEN_NAME, null);
  const [loginStatus, _setLoginStatus] = usePersist<LoginStatus>(
    LOGIN_STATUS,
    LoginStatus.NotKnown
  );

  /** keep the conneccted user linkted to the current token */
  useEffect(() => {
    refresh();
  }, [token]);

  const setLoginStatus = (status: LoginStatus) => {
    if (DEBUG) console.log('setLoginStatus', status);
    _setLoginStatus(status);
  };

  const refresh = async () => {
    try {
      if (token) {
        const user = await _appFetch<AppUserRead>('/api/auth/me', {}, token);
        if (DEBUG) console.log('got connected user', { user });
        setConnectedUser(user);
        setHasTriedFetchingUser(true);
      } else {
        setConnectedUser(null);
      }
    } catch (e) {
      disconnect();
      setLoginStatus(LoginStatus.FullyLoggedOut);
    }
  };

  /** logged in status is strictly linked to the connected user,
   * this should be the only place on the app where the status is set to loggedIn
   */
  useEffect(() => {
    if (DEBUG) console.log('connectedUser', { connectedUser, loginStatus });

    if (connectedUser && connectedUser.email) {
      setLoginStatus(LoginStatus.BasicLoggedIn);
      return;
    }

    if (connectedUser && connectedUser.email && twitterProfile) {
      setLoginStatus(LoginStatus.FullyLoggedIn);
      return;
    }

    if (!connectedUser && loginStatus === LoginStatus.NotKnown) {
      setLoginStatus(LoginStatus.FullyLoggedOut);
    }
  }, [connectedUser, loginStatus]);

  const disconnect = () => {
    setToken(null);
  };

  const twitterProfile = connectedUser
    ? getAccount(connectedUser, PLATFORM.Twitter)?.profile
    : undefined;

  const email = connectedUser ? connectedUser.email : undefined;

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        hasTriedFetchingUser,
        twitterProfile,
        email,
        isConnected: connectedUser !== undefined && connectedUser !== null,
        disconnect,
        refresh,
        token,
        setToken,
        setLoginStatus,
        loginStatus,
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
