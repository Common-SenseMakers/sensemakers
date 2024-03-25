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

import { useAccountContext } from '../app/AccountContext';
import { useAppFetch } from '../app/app.fetch';
import { HandleSignupResult, PLATFORM } from '../shared/types';
import {
  TwitterGetContextParams,
  TwitterSignupContext,
} from '../shared/types.twitter';

const DEBUG = true;

const LS_TWITTER_CONTEXT_KEY = 'twitter-signin-context';

/** Manages the authentication process with Twitter */
export type TwitterContextType = {
  connect?: () => void;
  approve?: () => void;
  revokeApproval: () => void;
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

  const connect = async () => {
    setIsConnecting(true);

    const params: TwitterGetContextParams = {
      callback_url: window.location.href,
    };
    const siginContext = await appFetch<TwitterSignupContext>(
      `/auth/${PLATFORM.Twitter}/context`,
      params
    );

    /** remember the login context */
    localStorage.setItem(LS_TWITTER_CONTEXT_KEY, JSON.stringify(siginContext));

    /** go to twitter */
    window.location.href = siginContext.url;
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

      const context = JSON.parse(contextStr) as TwitterSignupContext;

      if (context.state !== state_param) {
        throw new Error('Undexpected state');
      }

      appFetch<HandleSignupResult>(`/auth/${PLATFORM.Twitter}/signup`, {
        ...context,
        code: code_param,
      }).then((result) => {
        if (result.ourAccessToken) {
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

  const approve = async () => {
    setIsApproving(true);
    window.location.href = '';
  };

  const revokeApproval = async () => {
    const revokeLink = await appFetch<string>(
      `/auth/${PLATFORM.Twitter}/revoke`
    );
    window.location.href = revokeLink;
  };

  return (
    <TwitterContextValue.Provider
      value={{
        connect,
        approve,
        revokeApproval,
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
