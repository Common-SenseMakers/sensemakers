import { Box } from 'grommet';

import { RightChevronIcon } from '../app/icons/RightChveronIcon';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

export enum SettingsSections {
  Support = 'support',
}

export const SettingsSection = (props: {
  icon: JSX.Element;
  title: string;
  description?: string | JSX.Element;
  onSectionClicked?: () => void;
  showChevron?: boolean;
}) => {
  const { constants } = useThemeContext();
  const showChevron =
    props.showChevron !== undefined ? props.showChevron : true;

  return (
    <AppButton
      plain
      onClick={() => (props.onSectionClicked ? props.onSectionClicked() : {})}>
      <Box
        pad={{ horizontal: '16px', vertical: '16px' }}
        direction="row"
        align="center"
        style={{ border: `1px solid ${constants.colors.border}` }}>
        <Box style={{ width: '30px' }}>{props.icon}</Box>
        <Box style={{ flexGrow: 1 }}>
          <Box
            style={{
              fontSize: '16px',
              lineHeight: '18px',
              fontWeight: 600,
            }}
            margin={{ horizontal: '8px' }}>
            {props.title}
          </Box>
          <Box
            style={{
              fontSize: '14px',
              lineHeight: '18px',
              fontWeight: 400,
            }}
            margin={{ horizontal: '8px' }}
            direction="row"
            gap="8px">
            {props.description}
          </Box>
        </Box>
        {showChevron && (
          <Box>
            <RightChevronIcon size={20}></RightChevronIcon>
          </Box>
        )}
      </Box>
    </AppButton>
  );
};
