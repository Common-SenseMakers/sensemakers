import { Box } from 'grommet';

import { NavButton } from '../app/NavButton';
import { LeftChevronIcon } from '../app/icons/LeftChveronIcon';
import { LeftIcon } from '../app/icons/LeftIcon';
import { RightIcon } from '../app/icons/RightIcon';
import { useThemeContext } from '../ui-components/ThemedApp';

export interface OnPostNav {
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const PostNav = (props: { onPostNav?: OnPostNav }) => {
  const { onPostNav } = props;
  const { constants } = useThemeContext();

  return (
    <Box
      style={{
        height: '40px',
        borderBottom: '1px solid #F3F4F6',
        backgroundColor: constants.colors.shade,
      }}
      pad={{ horizontal: '12px' }}
      direction="row"
      justify="between">
      {onPostNav && onPostNav.onBack && (
        <NavButton
          icon={<LeftChevronIcon></LeftChevronIcon>}
          label={'Back'}
          onClick={() => {
            if (onPostNav.onBack) onPostNav.onBack();
          }}></NavButton>
      )}

      <Box direction="row" gap="8px">
        <NavButton
          icon={<LeftIcon></LeftIcon>}
          disabled={onPostNav && !!onPostNav.onPrev}
          label="Previous"
          onClick={() =>
            onPostNav && onPostNav.onPrev && onPostNav.onPrev()
          }></NavButton>
        <NavButton
          reverse
          icon={
            <Box justify="center" style={{ width: '22px' }}>
              <RightIcon></RightIcon>
            </Box>
          }
          disabled={onPostNav && !!onPostNav.onNext}
          label="Next"
          onClick={() =>
            onPostNav && onPostNav.onNext && onPostNav.onNext()
          }></NavButton>
      </Box>
    </Box>
  );
};
