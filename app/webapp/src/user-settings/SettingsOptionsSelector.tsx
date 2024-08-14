import { Box, Text } from 'grommet';

import { BulletIcon } from '../app/icons/BulletIcon';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

interface SettingOption {
  id: string;
  title: string;
  description?: string;
  selected?: boolean;
  optionSelected: (id: string) => void;
}

export const SettingsOptionSelector = (props: { options: SettingOption[] }) => {
  const { constants } = useThemeContext();
  return (
    <Box>
      {props.options.map((option, ix) => {
        return (
          <AppButton plain onClick={() => option.optionSelected(option.id)}>
            <Box
              key={ix}
              direction="row"
              align="center"
              pad={{ horizontal: '20px', vertical: '16px' }}
              gap="12px"
              style={{
                backgroundColor: option.selected ? '#EDF7FF' : '#ffffff',
                border: `1px solid ${constants.colors.border}`,
              }}>
              <Box style={{ flexShrink: 0 }}>
                <BulletIcon selected={option.selected}></BulletIcon>
              </Box>
              <Box>
                <Box>
                  <Text style={{ fontWeight: 500 }}>{option.title}</Text>
                </Box>
                <Box>
                  <Text
                    style={{
                      color: constants.colors.textLight2,
                      fontWeight: 400,
                    }}>
                    {option.description}
                  </Text>
                </Box>
              </Box>
            </Box>
          </AppButton>
        );
      })}
    </Box>
  );
};
