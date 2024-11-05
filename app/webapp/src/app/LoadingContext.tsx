import { Box, Heading, Layer, Meter, Spinner, Text } from 'grommet';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useThemeContext } from '../ui-components/ThemedApp';

export interface LoadingOptions {
  title?: string;
  subtitle?: string;
  time?: number;
}

export type LoadingContextType = {
  loading: boolean;
  open: (options: LoadingOptions) => void;
  close: () => void;
  setLoading: (loading: boolean) => void;
  setExpectedLoadingTime: (loadingTimeout: number) => void;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setPause: (loading: boolean) => void;
  setUserCanClose: (canClose: boolean) => void;
};

export interface LoadingContextProps {
  children: ReactNode;
}

const LoadingContextValue = createContext<LoadingContextType | undefined>(
  undefined
);
const PERIOD = 100;
const RATE_CHANGE_AT = 0.6;

export const LoadingContext = ({ children }: LoadingContextProps) => {
  const { constants } = useThemeContext();
  const [loading, _setLoading] = useState<boolean>(false);
  const [expectedLoadingTime, _setExpectedLoadingTime] = useState<number>();
  const [timeElapsed, setTimeElapsed] = useState<number>();
  const [pause, setPause] = useState<boolean>(false);
  const [userCanClose, setUserCanClose] = useState<boolean>(false);

  const timeElapsedRef = useRef<number>(); // needed to prevent infinit loop effect trigger if setTimeElapsed depends on timeElapsed
  const pauseRef = useRef<boolean>(); // needed to prevent infinit loop effect trigger if setTimeElapsed depends on timeElapsed

  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');

  useEffect(() => {
    timeElapsedRef.current = timeElapsed;
  }, [timeElapsed]);

  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  const setLoading = (loading: boolean) => {
    _setLoading(loading);
  };

  const open = (options: LoadingOptions) => {
    setTitle(options.title || '');
    setSubtitle(options.subtitle || '');
    setExpectedLoadingTime(options.time || 0);
    setLoading(true);
  };

  const close = () => {
    setLoading(false);
    setTitle('');
    setSubtitle('');
    setExpectedLoadingTime(0);
  };

  /** an always-running periodic call */
  const updateTime = useCallback(() => {
    if (expectedLoadingTime && timeElapsedRef.current !== undefined) {
      const ratio = timeElapsedRef.current / expectedLoadingTime;
      const ratioPending = 1 - ratio;
      const increment = (() => {
        if (pauseRef.current) {
          return 0;
        }

        if (ratio < RATE_CHANGE_AT) {
          return PERIOD;
        } else {
          // slow down as we reach the end
          return (PERIOD * ratioPending) / (1 - RATE_CHANGE_AT);
        }
      })();

      setTimeElapsed(timeElapsedRef.current + increment);
    }
  }, [expectedLoadingTime]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTime();
    }, PERIOD);

    return () => clearInterval(intervalId);
  }, [expectedLoadingTime, updateTime]);

  const setExpectedLoadingTime = (timeMs: number) => {
    setTimeElapsed(0);
    _setExpectedLoadingTime(timeMs);
  };

  const userClose = () => {
    if (userCanClose) {
      setLoading(false);
    }
  };

  return (
    <LoadingContextValue.Provider
      value={{
        loading,
        close: close,
        open: open,
        setLoading,
        setExpectedLoadingTime,
        setTitle,
        setSubtitle,
        setPause,
        setUserCanClose,
      }}>
      {children}
      {loading && (
        <Layer
          position="center"
          onClickOutside={() => userClose()}
          onEsc={() => userClose()}
          style={{ borderRadius: '4px' }}
          responsive={false}>
          <Box elevation="large" style={{ width: '90vw', maxWidth: '600px' }}>
            <Box
              pad={{ vertical: 'large', horizontal: 'medium' }}
              gap="small"
              style={{ borderRadius: '10px' }}
              fill>
              <Heading level={3} as="header" textAlign="center">
                {title}
              </Heading>

              <Box
                style={{ width: '100%' }}
                align="center"
                margin={{ top: 'large' }}>
                <Text textAlign="center">{subtitle}</Text>
              </Box>

              <Box margin={{ vertical: 'large' }} align="center">
                {expectedLoadingTime ? (
                  <Meter
                    value={timeElapsed}
                    color={constants.colors.primary}
                    max={expectedLoadingTime}
                  />
                ) : (
                  <Box pad="small" justify="center" align="center">
                    <Spinner color={constants.colors.primary} />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Layer>
      )}
    </LoadingContextValue.Provider>
  );
};

export const useLoadingContext = () => {
  const context = useContext(LoadingContextValue);
  if (!context) throw Error('loading context not found');
  return context;
};
