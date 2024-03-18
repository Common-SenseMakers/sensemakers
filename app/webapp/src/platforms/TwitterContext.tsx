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

import { useAppFetch } from '../app/app.fetch';
import { PLATFORM } from '../shared/types';
import {
  TwitterSignupContext,
  TwitterSignupType,
  TwitterUser,
} from '../shared/types.twitter';

const DEBUG = true;

/** Manages the authentication process with Twitter */
export type TwitterContextType = {
  connect?: () => void;
  approve?: () => void;
  revokeApproval: () => void;
  isConnecting: boolean;
  isAuthorizing: boolean;
  needAuthorize?: boolean;
};

const TwitterContextValue = createContext<TwitterContextType | undefined>(
  undefined
);

/** Manages the authentication process */
export const TwitterContext = (props: PropsWithChildren) => {
  const verifierHandled = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const oauth_token_param = searchParams.get('oauth_token');
  const oauth_verifier_param = searchParams.get('oauth_verifier');

  const appFetch = useAppFetch();

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [needAuthorize, setNeedAuthorize] = useState<boolean>();

  const { data: siginContext } = useQuery<TwitterSignupContext>({
    queryKey: ['twitterSignup'],
    queryFn: async () => {
      const context = await appFetch<TwitterSignupContext>(
        '/auth/twitter-code',
        {
          type: TwitterSignupType.login,
        }
      );
      return context;
    },
  });

  const { data: approveContext } = useQuery<TwitterSignupContext>({
    queryKey: ['twitterSignup'],
    queryFn: async () => {
      const context = await appFetch<TwitterSignupContext>(
        `/auth/${PLATFORM.Twitter}/context`,
        {
          type: TwitterSignupType.approvePost,
        }
      );
      return context;
    },
  });

  const connect = siginContext
    ? async () => {
        setIsConnecting(true);
        window.location.href = siginContext.url;
      }
    : undefined;

  const approve = approveContext
    ? async () => {
        setIsApproving(true);
        window.location.href = approveContext.url;
      }
    : undefined;

  const revokeApproval = async () => {
    const revokeLink = await appFetch<string>(
      `/auth/${PLATFORM.Twitter}/revoke`
    );
    window.location.href = revokeLink;
  };

  /** Listen to oauth verifier to send it to the backend */
  useEffect(() => {
    if (!verifierHandled.current && oauth_token_param && oauth_verifier_param) {
      verifierHandled.current = true;

      setIsConnecting(true);

      appFetch(`/auth/twitter-verifier`, {
        oauth_verifier: oauth_verifier_param,
        oauth_token: oauth_token_param,
      }).then(() => {
        searchParams.delete('oauth_token');
        searchParams.delete('oauth_verifier');
        setSearchParams(searchParams);
        setIsConnecting(false);
      });
    }
  }, [oauth_token_param, oauth_verifier_param, searchParams, setSearchParams]);

  return (
    <TwitterContextValue.Provider
      value={{
        connect,
        approve,
        revokeApproval,
        isConnecting,
        isAuthorizing: isApproving,
        needAuthorize,
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
