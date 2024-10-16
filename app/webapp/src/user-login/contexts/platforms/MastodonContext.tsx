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
import { I18Keys } from '../../../i18n/i18n';
import { HandleSignupResult } from '../../../shared/types/types.fetch';
import {
  MastodonGetContextParams,
  MastodonSignupContext,
  MastodonSignupData,
} from '../../../shared/types/types.mastodon';
import { PLATFORM } from '../../../shared/types/types.platforms';
import { usePersist } from '../../../utils/use.persist';
import {
  LoginFlowState,
  OverallLoginStatus,
  PlatformConnectedStatus,
  useAccountContext,
} from '../AccountContext';

const DEBUG = false;

const log = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};
const WAS_CONNECTING_MASTODON = 'was-connecting-mastodon';

export const LS_MASTODON_CONTEXT_KEY = 'mastodon-signin-context';

export type MastodonContextType = {
  connect?: (
    domain: string,
    type: MastodonGetContextParams['type'],
    callbackUrl?: string
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
    refresh: refreshConnected,
    overallLoginStatus,
    setLoginFlowState,
    setPlatformConnectedStatus,
    getPlatformConnectedStatus,
  } = useAccountContext();

  const [wasConnecting, setWasConnecting] = usePersist<boolean>(
    WAS_CONNECTING_MASTODON,
    false
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | undefined>(undefined);
  const code_param = searchParams.get('code');

  const appFetch = useAppFetch();

  const needConnect =
    !connectedUser ||
    !connectedUser.profiles ||
    !connectedUser.profiles[PLATFORM.Mastodon];

  useEffect(() => {
    if (error) {
      show({
        title: 'Error Connecting Mastodon',
        message: error,
      });
    }
  }, [error]);

  const connect = useCallback(
    async (
      domain: string,
      type: MastodonGetContextParams['type'],
      callbackUrl?: string
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
          callback_url: window.location.href,
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
          setWasConnecting(true);
          log(
            'Redirecting to Mastodon authorization URL',
            signupContext.authorizationUrl
          );
          window.location.href = signupContext.authorizationUrl;
        }
      } catch (err: any) {
        log('Error connecting to Mastodon', err);
        setError(t(I18Keys.errorConnectMastodon, { domain }));
        setLoginFlowState(LoginFlowState.Idle);
        setPlatformConnectedStatus(
          PLATFORM.Mastodon,
          PlatformConnectedStatus.Disconnected
        );
      }
    },
    [appFetch, setLoginFlowState]
  );

  useEffect(() => {
    if (!verifierHandled.current) {
      if (
        code_param &&
        connectedUser &&
        wasConnecting &&
        (overallLoginStatus === OverallLoginStatus.PartialLoggedIn ||
          getPlatformConnectedStatus(PLATFORM.Mastodon) ===
            PlatformConnectedStatus.Connecting)
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
          refreshConnected();
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
            signupData,
            true
          ).then((result) => {
            log('Mastodon signup result', result);
            if (result) {
              localStorage.removeItem(LS_MASTODON_CONTEXT_KEY);
            }

            searchParams.delete('code');
            setPlatformConnectedStatus(
              PLATFORM.Mastodon,
              PlatformConnectedStatus.Connected
            );
            refreshConnected();
            setSearchParams(searchParams);
          });
        }

        setWasConnecting(false);
      }
    }
  }, [
    code_param,
    overallLoginStatus,
    searchParams,
    connectedUser,
    setSearchParams,
  ]);

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
