import { useQuery } from '@tanstack/react-query';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../../../api/app.fetch';
import { HandleSignupResult, PLATFORM } from '../../../shared/types/types';
import {
  TwitterGetContextParams,
  TwitterSignupContext,
} from '../../../shared/types/types.twitter';
import { useAccountContext } from '../AccountContext';

const DEBUG = true;

const LS_TWITTER_CONTEXT_KEY = 'twitter-signin-context';

/** Manages the authentication process with Twitter */
export type TwitterContextType = {
  connect?: (type: TwitterGetContextParams['type']) => void;
  isConnecting: boolean;
  isApproving: boolean;
  needConnect?: boolean;
};

const TwitterContextValue = createContext<TwitterContextType | undefined>(
  undefined
);

/** Manages the authentication process */
export const TwitterContext = (props: PropsWithChildren) => {
  const verifierHandled = useRef(false);

  const {
    connectedUser,
    refresh: refreshConnected,
    setToken: setOurToken,
  } = useAccountContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const state_param = searchParams.get('state');
  const code_param = searchParams.get('code');

  const appFetch = useAppFetch();

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const needConnect = !connectedUser || !connectedUser[PLATFORM.Twitter];

  const connect = async (type: TwitterGetContextParams['type']) => {
    setIsConnecting(true);

    const params: TwitterGetContextParams = {
      callback_url: window.location.href,
      type,
    };
    const siginContext = await appFetch<TwitterSignupContext>(
      `/app/auth/${PLATFORM.Twitter}/context`,
      params
    );

    /** remember the login context */
    localStorage.setItem(LS_TWITTER_CONTEXT_KEY, JSON.stringify(siginContext));

    /** go to twitter */
    if (siginContext) {
      window.location.href = siginContext.url;
    }
  };

  /** Listen to oauth verifier to send it to the backend */
  useEffect(() => {
    if (!verifierHandled.current && code_param && state_param) {
      verifierHandled.current = true;

      setIsConnecting(true);

      const contextStr = localStorage.getItem(LS_TWITTER_CONTEXT_KEY);

      if (contextStr === null) {
        throw new Error('Twitter context not found');
      }

      localStorage.removeItem(LS_TWITTER_CONTEXT_KEY);

      const context = JSON.parse(contextStr) as TwitterSignupContext;

      if (context.state !== state_param) {
        throw new Error('Undexpected state');
      }

      appFetch<HandleSignupResult>(`/app/auth/${PLATFORM.Twitter}/signup`, {
        ...context,
        code: code_param,
      }).then((result) => {
        if (result && result.ourAccessToken) {
          setOurToken(result.ourAccessToken);
        }

        searchParams.delete('state');
        searchParams.delete('code');
        setSearchParams(searchParams);
        setIsConnecting(false);
        refreshConnected();
      });
    }
  }, [state_param, code_param, searchParams, setSearchParams]);

  return (
    <TwitterContextValue.Provider
      value={{
        connect,
        isConnecting,
        isApproving,
        needConnect,
      }}>
      {props.children}
    </TwitterContextValue.Provider>
  );
};

export const useTwitterContext = (): TwitterContextType => {
  const context = useContext(TwitterContextValue);
  if (!context) throw Error('context not found');
  return context;
};
