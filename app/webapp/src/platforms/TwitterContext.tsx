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
import { PLATFORM } from '../shared/types';
import {
  TwitterSignupContext,
  TwitterSignupType,
  TwitterUser,
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

  const { connectedUser, refresh: refreshConnected } = useAccountContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const oauth_token_param = searchParams.get('oauth_token');
  const oauth_verifier_param = searchParams.get('oauth_verifier');

  const appFetch = useAppFetch();

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const needConnect = !connectedUser || !connectedUser[PLATFORM.Twitter];

  const connect = async () => {
    setIsConnecting(true);

    const siginContext = await appFetch<TwitterSignupContext>(
      `/auth/${PLATFORM.Twitter}/context`,
      {
        type: TwitterSignupType.login,
      }
    );

    /** remember the login context */
    localStorage.setItem(LS_TWITTER_CONTEXT_KEY, JSON.stringify(siginContext));

    /** go to twitter */
    window.location.href = siginContext.url;
  };

  /** Listen to oauth verifier to send it to the backend */
  useEffect(() => {
    if (!verifierHandled.current && oauth_token_param && oauth_verifier_param) {
      verifierHandled.current = true;

      setIsConnecting(true);

      const contextStr = localStorage.getItem(LS_TWITTER_CONTEXT_KEY);

      if (contextStr === null) {
        throw new Error('Twitter context not found');
      }

      const context = JSON.parse(contextStr) as TwitterSignupContext;

      if (context.oauth_token !== oauth_token_param) {
        throw new Error('Undexpected oauth token');
      }

      appFetch(`/auth/${PLATFORM.Twitter}/signup`, {
        oauth_verifier: oauth_verifier_param,
        oauth_token: context.oauth_token,
        oauth_token_secret: context.oauth_token_secret,
      }).then(() => {
        searchParams.delete('oauth_token');
        searchParams.delete('oauth_verifier');
        setSearchParams(searchParams);
        setIsConnecting(false);
        refreshConnected();
      });
    }
  }, [oauth_token_param, oauth_verifier_param, searchParams, setSearchParams]);

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
