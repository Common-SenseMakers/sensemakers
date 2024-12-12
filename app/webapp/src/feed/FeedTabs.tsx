import { Box, BoxExtendedProps, Text } from 'grommet';
import { useEffect, useRef, useState } from 'react';
import { CSSProperties } from 'styled-components';

import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { useThemeContext } from '../ui-components/ThemedApp';
import { FeedTabConfig } from './feed.config';

const Chevron = (props: { direction: 'left' | 'right' }) => {
  const { direction } = props;
  const rotate = direction === 'right' ? 'rotate(0deg)' : 'rotate(180deg)';
  return (
    <BoxCentered
      style={{
        height: '24px',
        width: '24px',
        borderRadius: '12px',
        border: '1px solid #D1D5DB',
        background: '#F9FAFB',
      }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        style={{ transform: rotate }}>
        <path
          d="M6.6001 4L10.6001 8L6.6001 12"
          stroke="#4B5563"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BoxCentered>
  );
};

const LeftIcon = () => <Chevron direction="left"></Chevron>;
const RightIcon = () => <Chevron direction="right"></Chevron>;

export const FeedTabs = (props: {
  feedTabs: FeedTabConfig[];
  onTabClicked: (tabIx: number) => void;
  feedIx: number;
}) => {
  const { constants } = useThemeContext();
  const { feedTabs, onTabClicked, feedIx } = props;

  const [showRightCaret, setShowRightCaret] = useState(false);
  const [showLeftCaret, setShowLeftCaret] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Check for overflow and update right caret visibility
  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      if (container) {
        const isOverflowing = container.scrollWidth > container.clientWidth;
        setShowRightCaret(
          isOverflowing &&
            container.scrollLeft + container.clientWidth < container.scrollWidth
        );
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  // Update the visibility of the right caret based on scroll position
  const handleScroll = () => {
    const container = containerRef.current;
    if (container) {
      const atRightEnd =
        container.scrollWidth -
          Math.ceil(container.scrollLeft + container.clientWidth) <=
        1;
      setShowRightCaret(!atRightEnd);
      setShowLeftCaret(atRightEnd);
    }
  };

  const scrollToRight = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        left: container.scrollWidth - container.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  const scrollToLeft = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  };

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
      ref={containerRef}
      onScroll={handleScroll}
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
      {showLeftCaret && (
        <Box
          onClick={() => scrollToLeft()}
          justify="end"
          style={{
            cursor: 'pointer',
            position: 'absolute',
            left: '0',
            top: '0',
            height: '63px',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            width: '48px',
            background:
              'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,1))',
          }}>
          <LeftIcon></LeftIcon>
        </Box>
      )}
      {showRightCaret && (
        <Box
          onClick={() => scrollToRight()}
          justify="end"
          style={{
            cursor: 'pointer',
            position: 'absolute',
            right: '0',
            top: '0',
            height: '63px',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            width: '48px',
            background:
              'linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))',
          }}>
          <RightIcon></RightIcon>
        </Box>
      )}
    </div>
  );
};
