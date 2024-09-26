// TODO: implement the bluesky context
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useAppFetch } from '../../../api/app.fetch';
import { useToastContext } from '../../../app/ToastsContext';
import { BlueskySignupData } from '../../../shared/types/types.bluesky';
import { HandleSignupResult } from '../../../shared/types/types.fetch';
import { PLATFORM } from '../../../shared/types/types.user';
import {
  BlueskyConnectedStatus,
  LoginFlowState,
  useAccountContext,
} from '../AccountContext';

const DEBUG = false;

const log = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

export type BlueskyContextType = {
  connect?: (username: string, appPassword: string) => Promise<void>;
  needConnect?: boolean;
  error?: string;
};

const BlueskyContextValue = createContext<BlueskyContextType | undefined>(
  undefined
);

export const BlueskyContext = (props: PropsWithChildren) => {
  const { show } = useToastContext();
  const { t } = useTranslation();

  const {
    connectedUser,
    refresh: refreshConnected,
    overallLoginStatus,
    setLoginFlowState,
    setBlueskyConnectedStatus,
    blueskyConnectedStatus,
  } = useAccountContext();

  const [error, setError] = useState<string | undefined>(undefined);

  const appFetch = useAppFetch();

  const needConnect = !connectedUser || !connectedUser[PLATFORM.Bluesky];

  const connect = useCallback(
    async (username: string, appPassword: string) => {
      setLoginFlowState(LoginFlowState.ConnectingBluesky);
      setBlueskyConnectedStatus(BlueskyConnectedStatus.Connecting);
      setError(undefined);

      try {
        const signupData: BlueskySignupData = {
          username,
          appPassword,
        };

        log('Calling Bluesky signup', signupData);

        const result = await appFetch<HandleSignupResult>(
          `/api/auth/${PLATFORM.Bluesky}/signup`,
          signupData,
          true
        );

        log('Bluesky signup result', result);

        if (result) {
          refreshConnected();
          setBlueskyConnectedStatus(BlueskyConnectedStatus.Connected);
        } else {
          throw new Error('Signup failed');
        }
      } catch (err: any) {
        log('Error connecting to Bluesky', err);
        setError('Error connecting to Bluesky');
        setLoginFlowState(LoginFlowState.Idle);
        setBlueskyConnectedStatus(BlueskyConnectedStatus.Disconnected);
      }
    },
    [
      appFetch,
      setLoginFlowState,
      setBlueskyConnectedStatus,
      refreshConnected,
      t,
    ]
  );

  return (
    <BlueskyContextValue.Provider
      value={{
        connect,
        needConnect,
        error,
      }}>
      {props.children}
    </BlueskyContextValue.Provider>
  );
};

export const useBlueskyContext = (): BlueskyContextType => {
  const context = useContext(BlueskyContextValue);
  if (!context) throw Error('context not found');
  return context;
};
