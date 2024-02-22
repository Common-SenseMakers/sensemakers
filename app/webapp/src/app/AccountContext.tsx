import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { getLoggedUser, postOrcidCode } from '../functionsCalls/auth.requests';
import { AppUserRead } from '../shared/types';
import { ORCID_API_URL, ORCID_CLIENT_ID, ORCID_REDIRECT_URL } from './config';

const DEBUG = true;

const ORCID_LOGIN_URL = `${ORCID_API_URL}/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${ORCID_REDIRECT_URL}`;

export type AccountContextType = {
  connectedUser?: AppUserRead;
  isConnected: boolean;
  isInitializing: boolean;
  isConnecting: boolean;
  isGettingUser: boolean;
  disconnect: () => void;
  connect: () => void;
  refresh: () => void;
  appAccessToken?: string;
};

const AccountContextValue = createContext<AccountContextType | undefined>(
  undefined
);

/** Manages the authentication process */
export const AccountContext = (props: PropsWithChildren) => {
  const codeHandled = useRef(false);
  const tokenHandled = useRef(false);

  /**
   * undefined, is checking
   * null, checked not connected
   * defined, connected
   */
  const [connectedUser, setConnectedUser] = useState<AppUserRead | null>();
  const [token, setToken] = useState<string>();

  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isGettingUser, setIsGettingUser] = useState<boolean>(false);

  // Extract the code from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get('code');

  const checkToken = () => {
    const token = localStorage.getItem('token');

    if (token !== null) {
      if (DEBUG) console.log('tokend found in localstorage');
      setToken(token);
    } else {
      setToken(undefined);
      setConnectedUser(null);
      setIsInitializing(false);
    }
  };

  const refresh = () => {
    if (token) {
      setIsGettingUser(false);
      getLoggedUser(token).then((user) => {
        if (DEBUG) console.log('got connected user', { user });
        setIsGettingUser(false);
        setConnectedUser(user);
        setIsInitializing(false);
      });
    }
  };

  useEffect(() => {
    if (!tokenHandled.current && token) {
      tokenHandled.current = true;
      refresh();
    }
  }, [token]);

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    if (!codeHandled.current && code) {
      codeHandled.current = true;
      if (DEBUG) console.log('code received', { code });
      setIsConnecting(true);

      postOrcidCode(code).then((token) => {
        if (DEBUG)
          console.log('token received (sliced)', { token: token.slice(0, 8) });

        searchParams.delete('code');
        setSearchParams(searchParams);
        localStorage.setItem('token', token);

        setIsConnecting(false);
        checkToken();
      });
    }
  }, [code, searchParams, setSearchParams]);

  const disconnect = () => {
    if (DEBUG) console.log('disconnecting');
    localStorage.removeItem('token');
    checkToken();
  };

  const connect = () => {
    setIsConnecting(true);
    window.location.href = ORCID_LOGIN_URL;
  };

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        isConnected: connectedUser !== undefined && connectedUser !== null,
        isInitializing,
        isConnecting,
        isGettingUser,
        connect,
        disconnect,
        refresh,
        appAccessToken: token,
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
