import {
  Anchor,
  AreasType,
  Box,
  BoxExtendedProps,
  BoxProps,
  Grid,
  GridColumnsType,
  GridExtendedProps,
  GridSizeType,
  ResponsiveContext,
  Text,
} from 'grommet';
import { ReactNode, createContext, useContext } from 'react';

import { AppHeading } from '../../ui-components';
import { useResponsive } from '../../ui-components/ResponsiveApp';
import { useThemeContext } from '../../ui-components/ThemedApp';
import { AppLogo } from '../brand/AppLogo';
import { BUILD_ID } from '../config';
import { AppIcon } from '../icons/AppIcon';

export const MAX_WIDTH_LANDING = 1600;
export const MAX_WIDTH_APP = 600;
export const MAX_BUTTON_WIDTH = 1600;

export const ViewportContainer = (props: React.HTMLProps<HTMLDivElement>) => {
  const { constants } = useThemeContext();
  const footerHeight = '48px';
  return (
    <>
      <Box
        id="viewport-container"
        style={{
          height: `calc(100vh - ${footerHeight})`,
          width: '100vw',
          overflow: 'hidden',
          maxWidth: `${MAX_WIDTH_LANDING}px`,
          margin: '0 auto',
          ...props.style,
        }}>
        {props.children}
      </Box>
      <Box
        id="footer"
        style={{
          height: footerHeight,
          flexShrink: 0,
          backgroundColor: constants.colors.shade,
        }}
        pad="medium"
        justify="center"
        align="center">
        <Box
          direction="row"
          justify="center"
          fill
          align="center"
          style={{
            position: 'relative',
          }}>
          <Anchor
            href={`https://twitter.com/${process.env.PROJECT_TWITTER_ACCOUNT as string}`}
            target="_blank">
            <AppIcon size={14}></AppIcon>
          </Anchor>
          <Box
            style={{
              position: 'absolute',
              right: '0px',
              bottom: '0px',
            }}>
            <Text size="6px" color="white">
              Build: {BUILD_ID?.substring(0, 7)}
            </Text>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export const ViewportHeadingSmall = (props: { label: ReactNode }) => {
  return (
    <Box justify="center" align="center" pad="medium">
      <Text size="22px" weight="bold">
        {props.label}
      </Text>
    </Box>
  );
};

export const ViewportHeadingLarge = (props: { label: ReactNode }) => {
  return (
    <Box
      justify="center"
      align="center"
      pad="medium"
      style={{ textAlign: 'center' }}>
      <AppHeading level="1">{props.label}</AppHeading>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ViewportPageContext {}

export const ViewportPageContextValue = createContext<
  ViewportPageContext | undefined
>(undefined);

/**
 * fill the vertical space with a scrollable content area, and leave the bottom
 * fixed to the navigation buttons
 */
export const ViewportPage = (props: {
  content: ReactNode;
  nav?: ReactNode;
  justify?: BoxProps['justify'];
  fixed?: boolean;
  addLogo?: boolean;
}) => {
  const { mobile } = useResponsive();
  const pad = mobile ? 'none' : 'large';
  const fixed = props.fixed !== undefined ? props.fixed : false;
  const addLogo = props.addLogo !== undefined ? props.addLogo : false;

  return (
    <ViewportPageContextValue.Provider value={{}}>
      <Box
        id="viewport-page"
        pad={pad}
        style={{
          height: '100%',
          width: '100%',
          maxWidth: `${MAX_WIDTH_APP}px`,
          margin: '0 auto',
          overflow: 'hidden',
        }}>
        <Box
          id="content"
          style={
            fixed
              ? { height: 'calc(100% - 48px)' }
              : { flexGrow: 1, overflowY: 'auto' }
          }>
          <Box
            style={fixed ? { height: '100%' } : { flexGrow: 1, flexShrink: 0 }}
            justify={props.justify || 'center'}>
            {addLogo ? (
              <>
                <Box pad={{ horizontal: '12px' }}>
                  <AppLogo></AppLogo>
                </Box>
                <Box width="100%" height="40px"></Box>
              </>
            ) : (
              <></>
            )}
            {props.content}
          </Box>
        </Box>
        {props.nav ? (
          <Box id="nav" style={{ height: '48px', flexShrink: 0 }}>
            {props.nav}
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </ViewportPageContextValue.Provider>
  );
};

export const useViewport = (): ViewportPageContext => {
  const context = useContext(ViewportPageContextValue);
  if (!context) throw Error('context not found');
  return context;
};

export interface ITwoColumns {
  children?: ReactNode | ReactNode[];
  grid?: GridExtendedProps;
  boxes?: BoxExtendedProps;
  gap?: number;
  line?: boolean;
  frs?: number[];
}

export enum Breakpoint {
  small = 'small',
  medium = 'medium',
  large = 'large',
  xlarge = 'xlarge',
}

export interface IResponsiveGrid extends GridExtendedProps {
  columnsAt: Record<Breakpoint, GridColumnsType>;
  rowsAt: Record<Breakpoint, GridSizeType | GridSizeType[]>;
  areasAt?: Record<Breakpoint, AreasType>;
}

export const ResponsiveGrid = (props: IResponsiveGrid) => (
  <ResponsiveContext.Consumer>
    {(_size) => {
      const size = _size as Breakpoint;

      const columnsVal = props.columnsAt[size];
      const rowsVal = props.rowsAt[size];
      const areasVal = props.areasAt ? props.areasAt[size] : undefined;

      return (
        <Grid {...props} rows={rowsVal} columns={columnsVal} areas={areasVal}>
          {props.children}
        </Grid>
      );
    }}
  </ResponsiveContext.Consumer>
);
