import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../../../api/app.fetch';
import { useToastContext } from '../../../app/ToastsContext';
import { I18Keys } from '../../../i18n/i18n';
import { HandleSignupResult } from '../../../shared/types/types.fetch';
import { PLATFORM } from '../../../shared/types/types.platforms';
import {
  TwitterGetContextParams,
  TwitterSignupContext,
} from '../../../shared/types/types.twitter';
import { usePersist } from '../../../utils/use.persist';
import {
  LoginFlowState,
  OverallLoginStatus,
  PlatformConnectedStatus,
  useAccountContext,
} from '../AccountContext';
import { useDisconnectContext } from '../DisconnectUserContext';

const DEBUG = true;
const WAS_CONNECTING_TWITTER = 'was-connecting-twitter';

export const LS_TWITTER_CONTEXT_KEY = 'twitter-signin-context';

/** Manages the authentication process with Twitter */
export type TwitterContextType = {
  connect?: (type: TwitterGetContextParams['type']) => void;
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
    overallLoginStatus,
    setLoginFlowState,
    getPlatformConnectedStatus,
    setPlatformConnectedStatus,
  } = useAccountContext();

  const { disconnect } = useDisconnectContext();

  const [wasConnecting, setWasConnecting] = usePersist<boolean>(
    WAS_CONNECTING_TWITTER,
    false
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const state_param = searchParams.get('state');
  const code_param = searchParams.get('code');
  const error_param = searchParams.get('error');

  const appFetch = useAppFetch();

  const needConnect =
    !connectedUser ||
    !connectedUser.profiles ||
    !connectedUser.profiles[PLATFORM.Twitter];

  const connect = async (type: TwitterGetContextParams['type']) => {
    setLoginFlowState(LoginFlowState.ConnectingTwitter);
    getPlatformConnectedStatus(PLATFORM.Twitter);
    setPlatformConnectedStatus(
      PLATFORM.Twitter,
      PlatformConnectedStatus.Connecting
    );

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
      setWasConnecting(true);
      window.location.href = siginContext.url;
    }
  };

  /** Listen to oauth verifier to send it to the backend */
  useEffect(() => {
    if (!verifierHandled.current) {
      if (error_param) {
        if (DEBUG)
          console.error('error on TwitterSignup', {
            error_param,
          });

        setPlatformConnectedStatus(
          PLATFORM.Twitter,
          PlatformConnectedStatus.Disconnected
        );
        show({ title: t(I18Keys.errorConnectTwitter), message: error_param });
        searchParams.delete('error');
        searchParams.delete('state');
        setSearchParams(searchParams);
      }

      if (wasConnecting && !state_param && !code_param) {
        if (DEBUG)
          console.log('was connecting true but no state params - logout', {
            state_param,
            code_param,
            overallLoginStatus,
          });

        setWasConnecting(false);
        disconnect();
      }

      if (
        code_param &&
        state_param &&
        connectedUser &&
        wasConnecting &&
        (overallLoginStatus === OverallLoginStatus.PartialLoggedIn ||
          getPlatformConnectedStatus(PLATFORM.Twitter) ===
            PlatformConnectedStatus.Connecting)
      ) {
        if (DEBUG)
          console.log('useEffect TwitterSignup', {
            state_param,
            code_param,
            overallLoginStatus,
          });

        verifierHandled.current = true;

        const contextStr = localStorage.getItem(LS_TWITTER_CONTEXT_KEY);

        if (contextStr === null) {
          // unexpected state, reset
          searchParams.delete('state');
          searchParams.delete('code');
          refreshConnected();
          setSearchParams(searchParams);
        } else {
          const context = JSON.parse(contextStr) as TwitterSignupContext;

          if (context.state !== state_param) {
            throw new Error('Unexpected state');
          }

          if (DEBUG)
            console.log(`calling api/auth/${PLATFORM.Twitter}/signup`, context);

          appFetch<HandleSignupResult>(
            `/api/auth/${PLATFORM.Twitter}/signup`,
            {
              ...context,
              code: code_param,
            },
            true
          ).then((result) => {
            if (result) {
              localStorage.removeItem(LS_TWITTER_CONTEXT_KEY);
            }

            searchParams.delete('state');
            searchParams.delete('code');
            refreshConnected();
            setPlatformConnectedStatus(
              PLATFORM.Twitter,
              PlatformConnectedStatus.Connected
            );
            setSearchParams(searchParams);
          });
        }

        setWasConnecting(false);
      }
    }
  }, [
    state_param,
    code_param,
    overallLoginStatus,
    error_param,
    searchParams,
    connectedUser,
    setSearchParams,
  ]);

  return (
    <TwitterContextValue.Provider
      value={{
        connect,
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
