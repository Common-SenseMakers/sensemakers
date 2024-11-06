import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../../../api/app.fetch';
import { useToastContext } from '../../../app/ToastsContext';
import { IntroKeys } from '../../../i18n/i18n.intro';
import { HandleSignupResult } from '../../../shared/types/types.fetch';
import {
  MastodonGetContextParams,
  MastodonSignupContext,
  MastodonSignupData,
} from '../../../shared/types/types.mastodon';
import { PLATFORM } from '../../../shared/types/types.platforms';
import {
  LoginFlowState,
  PlatformConnectedStatus,
  useAccountContext,
} from '../AccountContext';

const DEBUG = false;

const log = (...args: unknown[]) => {
  if (DEBUG) console.log(...args);
};
export const LS_MASTODON_CONTEXT_KEY = 'mastodon-signin-context';

export type MastodonContextType = {
  connect?: (
    domain: string,
    type: MastodonGetContextParams['type'],
    callbackUrl: string
  ) => Promise<void>;
  needConnect?: boolean;
  error?: string;
};

const MastodonContextValue = createContext<MastodonContextType | undefined>(
  undefined
);

export const MastodonContext = (props: PropsWithChildren) => {
  const { show } = useToastContext();
  const { t } = useTranslation();
  const verifierHandled = useRef(false);

  const {
    connectedUser,
    setToken: setOurToken,
    refresh: refreshConnected,
    disconnect,
    overallLoginStatus,
    setLoginFlowState,
    setPlatformConnectedStatus,
    getPlatformConnectedStatus,
  } = useAccountContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | undefined>(undefined);
  const code_param = searchParams.get('code');

  const appFetch = useAppFetch();

  const needConnect =
    !connectedUser ||
    !connectedUser.profiles ||
    !connectedUser.profiles[PLATFORM.Mastodon];

  useEffect(() => {
    // reset error
    setError(undefined);
  }, []);

  useEffect(() => {
    if (error) {
      show({
        title: 'Error Connecting Mastodon',
        message: error,
      });
      setPlatformConnectedStatus(
        PLATFORM.Mastodon,
        PlatformConnectedStatus.Disconnected
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const connect = useCallback(
    async (
      domain: string,
      type: MastodonGetContextParams['type'],
      callbackUrl: string
    ) => {
      setLoginFlowState(LoginFlowState.ConnectingMastodon);
      setPlatformConnectedStatus(
        PLATFORM.Mastodon,
        PlatformConnectedStatus.Connecting
      );
      setError(undefined);

      try {
        const params: MastodonGetContextParams = {
          mastodonServer: domain,
          callback_url: callbackUrl,
          type,
        };
        log('Fetching Mastodon signup context', params);
        const signupContext = await appFetch<MastodonSignupContext>(
          `/api/auth/${PLATFORM.Mastodon}/context`,
          params
        );

        log('Received Mastodon signup context', signupContext);
        localStorage.setItem(
          LS_MASTODON_CONTEXT_KEY,
          JSON.stringify(signupContext)
        );

        if (signupContext) {
          setPlatformConnectedStatus(
            PLATFORM.Mastodon,
            PlatformConnectedStatus.Connecting
          );
          log(
            'Redirecting to Mastodon authorization URL',
            signupContext.authorizationUrl
          );
          window.location.href = signupContext.authorizationUrl;
        }
      } catch (err) {
        log('Error connecting to Mastodon', err);
        setError(t(IntroKeys.errorConnectMastodon, { domain }));
        setLoginFlowState(LoginFlowState.Idle);
        setPlatformConnectedStatus(
          PLATFORM.Mastodon,
          PlatformConnectedStatus.Disconnected
        );
      }
    },
    [appFetch, setLoginFlowState, setPlatformConnectedStatus, t]
  );

  useEffect(() => {
    if (
      getPlatformConnectedStatus(PLATFORM.Mastodon) ===
        PlatformConnectedStatus.Connecting &&
      !code_param
    ) {
      if (DEBUG)
        console.log('was connecting true but no state params - logout', {
          code_param,
          overallLoginStatus,
        });

      setPlatformConnectedStatus(
        PLATFORM.Mastodon,
        PlatformConnectedStatus.Disconnected
      );
      disconnect();
    }

    if (!verifierHandled.current) {
      if (
        code_param &&
        getPlatformConnectedStatus(PLATFORM.Mastodon) ===
          PlatformConnectedStatus.Connecting
      ) {
        log('useEffect MastodonSignup', {
          code_param,
          overallLoginStatus,
        });

        verifierHandled.current = true;

        const contextStr = localStorage.getItem(LS_MASTODON_CONTEXT_KEY);

        if (contextStr === null) {
          log('Unexpected state: Mastodon context not found in localStorage');
          // unexpected state, reset
          searchParams.delete('code');
          refreshConnected().catch(console.error);
          setSearchParams(searchParams);
        } else {
          const context = JSON.parse(contextStr) as MastodonSignupContext;

          log(`Calling api/auth/${PLATFORM.Mastodon}/signup`, context);

          const signupData: MastodonSignupData = {
            ...context,
            code: code_param,
            mastodonServer: new URL(context.authorizationUrl).hostname,
            callback_url: window.location.href,
            type: 'read',
          };

          appFetch<HandleSignupResult>(
            `/api/auth/${PLATFORM.Mastodon}/signup`,
            signupData
          )
            .then((result) => {
              log('Mastodon signup result', result);
              if (result) {
                localStorage.removeItem(LS_MASTODON_CONTEXT_KEY);
              }

              if (result && result.ourAccessToken) {
                setOurToken(result.ourAccessToken);
              } else {
                refreshConnected().catch(console.error);
              }

              searchParams.delete('code');
              setPlatformConnectedStatus(
                PLATFORM.Mastodon,
                PlatformConnectedStatus.Connected
              );
              refreshConnected().catch(console.error);
              setSearchParams(searchParams);
            })
            .catch(console.error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code_param, overallLoginStatus, searchParams, connectedUser]);

  return (
    <MastodonContextValue.Provider
      value={{
        connect,
        needConnect,
        error,
      }}>
      {props.children}
    </MastodonContextValue.Provider>
  );
};

export const useMastodonContext = (): MastodonContextType => {
  const context = useContext(MastodonContextValue);
  if (!context) throw Error('context not found');
  return context;
};
