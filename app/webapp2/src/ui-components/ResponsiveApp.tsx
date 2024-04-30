import { ResponsiveContext } from 'grommet';
import {
  CSSProperties,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { parseCssUnits } from './utils';

export type ResponsiveContextType = {
  size: string;
  mobile: boolean;
  vw: number;
  scaleText: (textSize: string) => string;
  responsiveStyle: (config: ResponsiveStyleConfig) => CSSProperties;
};

export type ResponsiveStylePoint = string[] | string;
export type ResponsiveStyleValue = [ResponsiveStylePoint, CSSProperties];
export type ResponsiveStyleConfig = ResponsiveStyleValue[] | CSSProperties;

const AppResponsiveContext = createContext<ResponsiveContextType | undefined>(
  undefined
);

export const ResponsiveApp = (props: React.PropsWithChildren): JSX.Element => {
  const size = useContext(ResponsiveContext);
  const mobile = size ? size.includes('small') : false;
  const [vw, setVw] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setVw(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures this effect runs once on mount and unmount

  const scaleText = useCallback(
    (textSize: string) => {
      const scale = ((): number => {
        switch (size) {
          case 'xsmall':
            return 0.4;
          case 'small':
            return 0.6;
          case 'medium':
            return 0.8;
          case 'large':
            return 1.0;
          default:
            return 1.0;
        }
      })();

      const [value, units] = parseCssUnits(textSize);
      return `${value * scale}${units}`;
    },
    [size]
  );

  const responsiveStyle = useCallback(
    (config: ResponsiveStyleConfig): CSSProperties => {
      if (config instanceof Array) {
        const found = config.find(([point, _]) => {
          return typeof point === 'string'
            ? point === size
            : point.includes(size);
        });
        return found ? found[1] : {};
      } else {
        // deafult will only return the style on mobile
        return mobile ? config : {};
      }
    },
    [size, mobile]
  );

  return (
    <AppResponsiveContext.Provider
      value={{ vw, mobile, scaleText, responsiveStyle, size }}>
      {props.children}
    </AppResponsiveContext.Provider>
  );
};

export function useResponsive(): ResponsiveContextType {
  const context = useContext(AppResponsiveContext);
  if (!context)
    throw Error(
      'useResponsive can only be used within the Web3ReactProvider component'
    );
  return context;
}
