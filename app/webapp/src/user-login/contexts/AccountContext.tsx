import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { _appFetch } from '../../api/app.fetch';
import { TwitterUserProfile } from '../../shared/types/types.twitter';
import { AppUserRead, PLATFORM } from '../../shared/types/types.user';
import { getAccount } from '../user.helper';
import { LS_TWITTER_CONTEXT_KEY } from './platforms/TwitterContext';

const DEBUG = true;

export const OUR_TOKEN_NAME = 'ourToken';

export type AccountContextType = {
  connectedUser?: AppUserRead;
  hasTriedFetchingUser: boolean;
  isConnected: boolean;
  twitterProfile?: TwitterUserProfile;
  email?: string;
  setEmail: (email: string) => void;
  isSettingEmail: boolean;
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

export enum LoginStatus {
  LoggedOut = 'LoggedOut',
  LoggingIn = 'LoggingIn',
  LoggedIn = 'LoggedIn',
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

  const _token = localStorage.getItem(OUR_TOKEN_NAME);
  const _twitterContext = localStorage.getItem(LS_TWITTER_CONTEXT_KEY);
  const [token, setToken] = useState<string | undefined>(
    _token ? _token : undefined
  );

  const [loginStatus, setLoginStatus] = useState<LoginStatus>(
    _twitterContext ? LoginStatus.LoggingIn : LoginStatus.LoggedOut
  );

  const [isSettingEmail, setIsSettingEmail] = useState<boolean>(false);

  const checkToken = () => {
    const _token = localStorage.getItem(OUR_TOKEN_NAME);

    if (_token !== null) {
      if (DEBUG) console.log('tokend found in localstorage');
      setToken(_token);
    } else {
      setToken(undefined);
      setConnectedUser(null);
    }
  };

  const refresh = async () => {
    try {
      if (token) {
        setLoginStatus(LoginStatus.LoggingIn);
        const user = await _appFetch<AppUserRead>('/api/auth/me', {}, token);
        setLoginStatus(LoginStatus.LoggedIn);
        if (DEBUG) console.log('got connected user', { user });
        setConnectedUser(user);
        setHasTriedFetchingUser(true);
      } else {
        setConnectedUser(null);
        if (loginStatus === LoginStatus.LoggedIn)
          setLoginStatus(LoginStatus.LoggedOut);
      }
    } catch (e) {
      disconnect();
      setLoginStatus(LoginStatus.LoggedOut);
    }
  };

  const setEmail = async (email: string) => {
    if (token) {
      setIsSettingEmail(true);
      _appFetch<AppUserRead>('/api/auth/setEmail', { email }, token)
        .then(() => {
          setIsSettingEmail(false);
          refresh();
        })
        .catch((e) => {
          console.error(e);
          setIsSettingEmail(false);
        });
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(OUR_TOKEN_NAME, token);
    }
    refresh();
  }, [token]);

  const disconnect = () => {
    if (DEBUG) console.log('disconnecting');
    localStorage.removeItem(OUR_TOKEN_NAME);
    checkToken();
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
        setEmail,
        isSettingEmail,
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
