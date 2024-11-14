import { Box, BoxExtendedProps, Text } from 'grommet';
import { CSSProperties } from 'styled-components';

import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { FeedTabConfig } from './feed.config';

export const FeedTabs = (props: {
  feedTabs: FeedTabConfig[];
  onTabClicked: (tabIx: number) => void;
  feedIx: number;
}) => {
  const { constants } = useThemeContext();
  const { feedTabs, onTabClicked, feedIx } = props;

  const borderStyle = `1px solid ${constants.colors.border}`;

  const tabElement = (text: string, ix: number, isSelected: boolean) => {
    const internalBoxProps: BoxExtendedProps = {
      direction: 'row',
      gap: '4px',
      align: 'center',
      justify: 'center',
      pad: { horizontal: '12px', vertical: '8px' },
      style: { minWidth: '88px' },
    };

    const externalBoxProps: BoxExtendedProps = {
      style: {
        flex: '0 0 auto',
        height: '100%',
        justifyContent: 'center',
        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
        borderTop: borderStyle,
        borderLeft: borderStyle,
        borderRight: borderStyle,
        borderBottom: isSelected ? 'none' : borderStyle,
        borderRadius: '8px 8px 0 0',
      },
    };

    return (
      <Box {...externalBoxProps} key={text}>
        <AppButton
          plain
          style={{ height: '100%' }}
          onClick={() => {
            onTabClicked(ix);
          }}>
          <Box {...internalBoxProps}>
            <Box justify="center">
              <Text size="small">{text}</Text>
            </Box>
          </Box>
        </AppButton>
      </Box>
    );
  };

  const spaceStyle: CSSProperties = {
    flex: '0 0 auto',
    height: '100%',
    borderBottom: borderStyle,
    width: '11px',
  };

  return (
    <div
      style={{
        height: '48px',
        display: 'flex',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
      {feedTabs.map((tab, ix) => (
        <Box
          direction="row"
          key={ix}
          style={{
            flex: '0 0 auto',
            height: '100%',
          }}>
          <div style={spaceStyle}></div>
          {tabElement(tab.title, ix, feedIx === ix)}
          {ix === feedTabs.length - 1 && <div style={spaceStyle}></div>}
        </Box>
      ))}
    </div>
  );
};
