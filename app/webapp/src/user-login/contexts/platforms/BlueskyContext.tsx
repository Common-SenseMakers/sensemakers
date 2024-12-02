// TODO: implement the bluesky context
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { useAppFetch } from '../../../api/app.fetch';
import {
  BlueskyGetContextParams,
  BlueskySignupData,
} from '../../../shared/types/types.bluesky';
import { HandleSignupResult } from '../../../shared/types/types.fetch';
import { PLATFORM } from '../../../shared/types/types.platforms';
import {
  LoginFlowState,
  PlatformConnectedStatus,
  useAccountContext,
} from '../AccountContext';

const DEBUG = false;

const log = (...args: unknown[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (DEBUG) console.log(...args);
};

export type BlueskyContextType = {
  connect?: (
    username: string,
    appPassword: string,
    type: BlueskyGetContextParams['type']
  ) => Promise<void>;
  needConnect?: boolean;
  error?: string;
};

const BlueskyContextValue = createContext<BlueskyContextType | undefined>(
  undefined
);

export const BlueskyContext = (props: PropsWithChildren) => {
  const {
    connectedUser,
    refresh: refreshConnected,
    setToken: setOurToken,
    setLoginFlowState,
    setPlatformConnectedStatus,
  } = useAccountContext();

  const [error, setError] = useState<string | undefined>(undefined);

  const appFetch = useAppFetch();

  const needConnect =
    !connectedUser ||
    !connectedUser.profiles ||
    !connectedUser.profiles[PLATFORM.Bluesky];

  const connect = useCallback(
    async (
      username: string,
      appPassword: string,
      type: BlueskyGetContextParams['type']
    ) => {
      setLoginFlowState(LoginFlowState.ConnectingBluesky);
      setPlatformConnectedStatus(
        PLATFORM.Bluesky,
        PlatformConnectedStatus.Connecting
      );
      setError(undefined);

      try {
        const signupData: BlueskySignupData = {
          username,
          appPassword,
          type,
        };

        log('Calling Bluesky signup', signupData);

        const result = await appFetch<HandleSignupResult>(
          `/api/auth/${PLATFORM.Bluesky}/signup`,
          signupData
        );

        if (result.ourAccessToken) {
          setOurToken(result.ourAccessToken);
        } else {
          refreshConnected().catch(console.error);
        }

        log('Bluesky signup result', result);
      } catch (err) {
        log('Error connecting to Bluesky', err);
        setError('Error connecting to Bluesky');
        setLoginFlowState(LoginFlowState.Idle);
        setPlatformConnectedStatus(
          PLATFORM.Bluesky,
          PlatformConnectedStatus.Disconnected
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setLoginFlowState, appFetch, refreshConnected, setOurToken]
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
