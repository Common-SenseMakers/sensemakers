// TODO implement the mastodon context
import {
  PropsWithChildren,
  createContext,
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
import { PLATFORM } from '../../../shared/types/types.user';
import { usePersist } from '../../../utils/use.persist';
import {
  LoginFlowState,
  MastodonConnectedStatus,
  OverallLoginStatus,
  useAccountContext,
} from '../AccountContext';

const DEBUG = false;
const WAS_CONNECTING_MASTODON = 'was-connecting-mastodon';

export const LS_MASTODON_CONTEXT_KEY = 'mastodon-signin-context';

export type MastodonContextType = {
  connect?: (domain: string, type: MastodonGetContextParams['type']) => void;
  needConnect?: boolean;
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
    setMastodonConnectedStatus,
  } = useAccountContext();

  const [wasConnecting, setWasConnecting] = usePersist<boolean>(
    WAS_CONNECTING_MASTODON,
    false
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const code_param = searchParams.get('code');

  const appFetch = useAppFetch();

  const needConnect = !connectedUser || !connectedUser[PLATFORM.Mastodon];

  const connect = async (
    domain: string,
    type: MastodonGetContextParams['type']
  ) => {
    setLoginFlowState(LoginFlowState.ConnectingMastodon);
    setMastodonConnectedStatus(MastodonConnectedStatus.Connecting);

    const params: MastodonGetContextParams = {
      domain,
      callback_url: window.location.href,
      type,
    };
    const signupContext = await appFetch<MastodonSignupContext>(
      `/api/auth/${PLATFORM.Mastodon}/context`,
      params
    );

    localStorage.setItem(
      LS_MASTODON_CONTEXT_KEY,
      JSON.stringify(signupContext)
    );

    if (signupContext) {
      setWasConnecting(true);
      window.location.href = signupContext.authorizationUrl;
    }
  };

  useEffect(() => {
    if (!verifierHandled.current) {
      if (
        code_param &&
        overallLoginStatus === OverallLoginStatus.PartialLoggedIn &&
        connectedUser &&
        wasConnecting
      ) {
        if (DEBUG)
          console.log('useEffect MastodonSignup', {
            code_param,
            overallLoginStatus,
          });

        verifierHandled.current = true;

        const contextStr = localStorage.getItem(LS_MASTODON_CONTEXT_KEY);

        if (contextStr === null) {
          // unexpected state, reset
          searchParams.delete('code');
          refreshConnected();
          setSearchParams(searchParams);
        } else {
          const context = JSON.parse(contextStr) as MastodonSignupContext;

          if (DEBUG)
            console.log(
              `calling api/auth/${PLATFORM.Mastodon}/signup`,
              context
            );

          const signupData: MastodonSignupData = {
            ...context,
            code: code_param,
            domain: new URL(context.authorizationUrl).hostname,
            callback_url: window.location.href,
            type: 'read',
          };

          appFetch<HandleSignupResult>(
            `/api/auth/${PLATFORM.Mastodon}/signup`,
            signupData,
            true
          ).then((result) => {
            if (result) {
              localStorage.removeItem(LS_MASTODON_CONTEXT_KEY);
            }

            searchParams.delete('code');
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
