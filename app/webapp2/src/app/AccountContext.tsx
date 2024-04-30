import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getLoggedUser, postOrcidCode } from '../functionsCalls/auth.requests';
import { AppUserRead } from '../shared/types/types';
import { _appFetch } from './app.fetch';

const DEBUG = true;

export const OUR_TOKEN_NAME = 'ourToken';

export type AccountContextType = {
  connectedUser?: AppUserRead;
  isConnected: boolean;
  disconnect: () => void;
  refresh: () => void;
  token?: string;
  setToken: (token: string) => void;
};

const AccountContextValue = createContext<AccountContextType | undefined>(
  undefined
);

/**
 * Manages the logged-in user. We use JWT tokens to authenticate
 * a logged in user to our backend. The JWT is set when the user
 * logsin or sign up with any supported platform, and is stored
 * in the localStorage
 */
export const AccountContext = (props: PropsWithChildren) => {
  const [connectedUser, setConnectedUser] = useState<AppUserRead | null>();
  const [token, setToken] = useState<string>();

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

  const refresh = () => {
    if (token) {
      getLoggedUser(token).then((user) => {
        if (DEBUG) console.log('got connected user', { user });
        setConnectedUser(user);
      });
    } else {
      setConnectedUser(null);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    refresh();
  }, [token]);

  const disconnect = () => {
    if (DEBUG) console.log('disconnecting');
    localStorage.removeItem('token');
    checkToken();
  };

  return (
    <AccountContextValue.Provider
      value={{
        connectedUser: connectedUser === null ? undefined : connectedUser,
        isConnected: connectedUser !== undefined && connectedUser !== null,
        disconnect,
        refresh,
        token,
        setToken,
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
