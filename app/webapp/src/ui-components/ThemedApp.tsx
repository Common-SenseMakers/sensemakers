import { BoxExtendedProps, Grommet } from 'grommet';
import { createContext, useContext, useState } from 'react';

import {
  ExtendedThemeType,
  StyleConstants,
  darkTheme,
  lightTheme,
} from './themes';

export type ThemeContextType = {
  theme: ExtendedThemeType;
  constants: StyleConstants;
  setTheme: (dark: boolean) => void;
};

export interface ThemeContextProps extends BoxExtendedProps {
  dum?: string;
}

const ThemeContextValue = createContext<ThemeContextType | undefined>(
  undefined
);

export const ThemedApp = (props: ThemeContextProps): JSX.Element => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const theme = isDark ? darkTheme : lightTheme;

  const setTheme = (dark: boolean): void => {
    setIsDark(dark);
  };

  return (
    <ThemeContextValue.Provider
      value={{ theme, constants: theme.constants, setTheme }}>
      <Grommet theme={theme} background={theme.constants.colors.shade}>
        {props.children}
      </Grommet>
    </ThemeContextValue.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContextValue);
  if (!context)
    throw Error(
      'useThemeContext can only be used within the CampaignContext component'
    );
  return context;
};
