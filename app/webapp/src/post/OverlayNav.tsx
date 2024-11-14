import { Box } from 'grommet';

import { NavButton } from '../app/NavButton';
import { LeftChevronIcon } from '../app/icons/LeftChveronIcon';
import { LeftIcon } from '../app/icons/LeftIcon';
import { RightIcon } from '../app/icons/RightIcon';

export interface OnOverlayNav {
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const OverlayNav = (props: { overlayNav?: OnOverlayNav }) => {
  const { overlayNav: onOverlayNav } = props;

  return (
    <Box
      style={{
        backgroundColor: '#FFFFFF',
        flexShrink: 0,
      }}
      pad={{ horizontal: '12px' }}
      direction="row"
      justify="between">
      {onOverlayNav && onOverlayNav.onBack && (
        <NavButton
          icon={<LeftChevronIcon></LeftChevronIcon>}
          label={'Back'}
          onClick={() => {
            if (onOverlayNav.onBack) onOverlayNav.onBack();
          }}></NavButton>
      )}

      <Box direction="row" gap="8px">
        {onOverlayNav && onOverlayNav.onPrev && (
          <NavButton
            icon={<LeftIcon></LeftIcon>}
            disabled={onOverlayNav && !!onOverlayNav.onPrev}
            label="Previous"
            onClick={() =>
              onOverlayNav && onOverlayNav.onPrev && onOverlayNav.onPrev()
            }></NavButton>
        )}
        {onOverlayNav && onOverlayNav.onNext && (
          <NavButton
            reverse
            icon={
              <Box justify="center" style={{ width: '22px' }}>
                <RightIcon></RightIcon>
              </Box>
            }
            disabled={onOverlayNav && !!onOverlayNav.onNext}
            label="Next"
            onClick={() =>
              onOverlayNav && onOverlayNav.onNext && onOverlayNav.onNext()
            }></NavButton>
        )}
      </Box>
    </Box>
  );
};
