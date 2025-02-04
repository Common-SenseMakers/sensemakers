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
  Layer,
  ResponsiveContext,
  Text,
} from 'grommet';
import { ReactNode, createContext, useContext, useState } from 'react';

import { ClustersMenu } from '../../posts.fetcher/ClustersMenu';
import { AppHeading } from '../../ui-components';
import { useResponsive } from '../../ui-components/ResponsiveApp';
import { useThemeContext } from '../../ui-components/ThemedApp';
import { BUILD_ID } from '../config';
import { AppIcon } from '../icons/AppIcon';

export const MAX_BUTTON_WIDTH = 1600;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ViewportFooter = () => {
  const { constants } = useThemeContext();

  return (
    <Box
      id="footer"
      style={{
        height: '100%',
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
          <AppIcon size={22}></AppIcon>
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
  );
};

export const ViewportContainer = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <>
      <Box
        id="viewport-container"
        style={{
          height: `calc(100vh`,
          width: '100vw',
          overflow: 'hidden',
          margin: '0 auto',
          ...props.style,
        }}>
        {props.children}
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
  suggestions?: ReactNode;
  justify?: BoxProps['justify'];
  fixed?: boolean;
  addLogo?: boolean;
}) => {
  const [showLeftbar, setShowLeftbar] = useState(false);
  const { mobile } = useResponsive();

  const columns = mobile
    ? ['auto'] // Mobile: 1 column
    : ['1fr', '2fr', '1fr']; // Desktop: 3 columns

  const rows = mobile ? ['1fr', '48px', '68px'] : ['1fr', '1fr', '68px'];

  const areas = mobile
    ? [
        { name: 'content', start: [0, 0], end: [0, 0] },
        { name: 'nav', start: [0, 1], end: [0, 1] },
        { name: 'footer', start: [0, 2], end: [0, 2] },
      ]
    : [
        { name: 'left', start: [0, 0], end: [0, 1] },
        { name: 'content', start: [1, 0], end: [1, 1] },
        { name: 'right-upper', start: [2, 0], end: [2, 0] },
        { name: 'right-lower', start: [2, 1], end: [2, 1] },
        { name: 'footer', start: [0, 2], end: [2, 2] },
      ];

  return (
    <ViewportPageContextValue.Provider value={{}}>
      {showLeftbar && (
        <Layer animate position="left">
          <button onClick={() => setShowLeftbar(!showLeftbar)}>hide</button>
          <ClustersMenu></ClustersMenu>
        </Layer>
      )}
      <Grid
        id="viewport-page"
        style={{ height: '100%' }}
        columns={columns}
        rows={rows}
        areas={areas}>
        <Box gridArea="content">{props.content}</Box>
        <Box gridArea="footer">
          <ViewportFooter></ViewportFooter>
        </Box>

        {mobile && (
          <>
            <Box gridArea="nav">{props.nav}</Box>
          </>
        )}
        {!mobile && (
          <>
            <Box gridArea="left">
              {props.nav && (
                <Box style={{ flexGrow: 1 }}>
                  <Box pad={{ vertical: '12px', horizontal: '16px' }}>
                    <AppIcon></AppIcon>
                  </Box>
                  {props.nav}
                </Box>
              )}
            </Box>
            <Box gridArea="right-upper">{props.suggestions}</Box>
            <Box gridArea="left-lower" background="yellow"></Box>
            <Box gridArea="right-lower" background="purple">
              <strong>Right Lower</strong>
            </Box>
            <Box gridArea="right-lower" background="purple">
              <strong>Footer</strong>
            </Box>
          </>
        )}
      </Grid>
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
