import { Box } from 'grommet';

import { RightChevronIcon } from '../app/icons/RightChveronIcon';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

export enum SettingsSections {
  Autopost = 'autopost',
  Notifications = 'notifications',
  Support = 'support',
}

export const SettingsSection = (props: {
  icon: JSX.Element;
  title: string;
  onSectionClicked: () => void;
}) => {
  const { constants } = useThemeContext();

  return (
    <AppButton plain onClick={() => props.onSectionClicked()}>
      <Box
        pad={{ horizontal: '16px', vertical: '16px' }}
        direction="row"
        align="center"
        style={{ border: `1px solid ${constants.colors.border}` }}>
        <Box style={{ width: '30px' }}>{props.icon}</Box>
        <Box
          style={{
            flexGrow: 1,
            fontSize: '16px',
            lineHeight: '18px',
            fontWeight: 600,
          }}
          margin={{ horizontal: '8px' }}>
          {props.title}
        </Box>
        <Box>
          <RightChevronIcon size={20}></RightChevronIcon>
        </Box>
      </Box>
    </AppButton>
  );
};
