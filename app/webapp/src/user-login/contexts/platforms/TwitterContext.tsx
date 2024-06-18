import { useQuery } from '@tanstack/react-query';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../../../api/app.fetch';
import { useToastContext } from '../../../app/ToastsContext';
import { I18Keys } from '../../../i18n/i18n';
import { HandleSignupResult } from '../../../shared/types/types.fetch';
import {
  TwitterGetContextParams,
  TwitterSignupContext,
} from '../../../shared/types/types.twitter';
import { PLATFORM } from '../../../shared/types/types.user';
import { useAccountContext } from '../AccountContext';

const DEBUG = false;

const LS_TWITTER_CONTEXT_KEY = 'twitter-signin-context';

/** Manages the authentication process with Twitter */
export type TwitterContextType = {
  connect?: (type: TwitterGetContextParams['type']) => void;
  isConnecting: boolean;
  needConnect?: boolean;
};

const TwitterContextValue = createContext<TwitterContextType | undefined>(
  undefined
);

/** Manages the authentication process */
export const TwitterContext = (props: PropsWithChildren) => {
  const { show } = useToastContext();
  const { t } = useTranslation();
  const verifierHandled = useRef(false);

  const {
    connectedUser,
    refresh: refreshConnected,
    setToken: setOurToken,
  } = useAccountContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const state_param = searchParams.get('state');
  const code_param = searchParams.get('code');
  const error_param = searchParams.get('error');

  const appFetch = useAppFetch();

  const [_isConnecting, setIsConnecting] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const needConnect = !connectedUser || !connectedUser[PLATFORM.Twitter];

  const connect = async (type: TwitterGetContextParams['type']) => {
    setIsConnecting(true);

    const params: TwitterGetContextParams = {
      callback_url: window.location.href,
      type,
    };
    const siginContext = await appFetch<TwitterSignupContext>(
      `/api/auth/${PLATFORM.Twitter}/context`,
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
    if (!verifierHandled.current) {
      if (error_param) {
        show({ title: t(I18Keys.errorConnectTwitter), message: error_param });
        searchParams.delete('error');
        searchParams.delete('state');
        setSearchParams(searchParams);
      }

      if (code_param && state_param) {
        verifierHandled.current = true;

        setIsConnecting(true);

        const contextStr = localStorage.getItem(LS_TWITTER_CONTEXT_KEY);

        if (contextStr === null) {
          // unexpected state, reset
          searchParams.delete('state');
          searchParams.delete('code');
          setIsConnecting(false);
          refreshConnected();
          setSearchParams(searchParams);
        } else {
          localStorage.removeItem(LS_TWITTER_CONTEXT_KEY);

          const context = JSON.parse(contextStr) as TwitterSignupContext;

          if (context.state !== state_param) {
            throw new Error('Undexpected state');
          }

          appFetch<HandleSignupResult>(`/api/auth/${PLATFORM.Twitter}/signup`, {
            ...context,
            code: code_param,
          }).then((result) => {
            if (result && result.ourAccessToken) {
              setOurToken(result.ourAccessToken);
            }

            searchParams.delete('state');
            searchParams.delete('code');
            setIsConnecting(false);
            refreshConnected();
            setSearchParams(searchParams);
          });
        }
      } else {
        if (state_param) {
          searchParams.delete('state');
          setSearchParams(searchParams);
        }
      }
      navigate(location.pathname, { replace: true });
    }
  }, [state_param, code_param, error_param, searchParams, setSearchParams]);

  const isConnecting =
    _isConnecting || (state_param !== undefined && code_param !== undefined);

  return (
    <TwitterContextValue.Provider
      value={{
        connect,
        isConnecting,
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
