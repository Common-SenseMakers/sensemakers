import { Box, Text } from 'grommet';
import { useState } from 'react';

import { CheckIcon } from '../app/icons/FilterIcon copy';
import { AppButton, AppInput } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

export const PlatformSection = (props: {
  icon: JSX.Element;
  platformName: string;
  username: string;
  buttonText: string;
  onButtonClicked: (inputText?: string) => void;
  connected: boolean;
  connecting?: boolean;
  hasInput?: boolean;
  inputPlaceholder?: string;
  inputValue?: string;
  isValidInput?: (input: string) => boolean;
}) => {
  const { constants } = useThemeContext();
  const [inputValue, setInputValue] = useState<string>(props.inputValue || '');

  return (
    <Box
      pad={{ horizontal: '16px', vertical: '16px' }}
      direction="row"
      align="center"
      style={{ border: `1px solid ${constants.colors.border}` }}>
      <Box style={{ width: '50px' }}>{props.icon}</Box>
      <Box
        style={{
          flexGrow: 1,
          fontSize: '16px',
          lineHeight: '18px',
          fontWeight: 600,
        }}
        margin={{ horizontal: '8px' }}>
        <Box>
          <Text>{props.platformName}</Text>
        </Box>
        <Box>
          {props.hasInput && !props.connected ? (
            <AppInput
              placeholder={props.inputPlaceholder}
              value={props.inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              style={{ width: '100%' }}
            />
          ) : (
            <Text
              style={{ fontWeight: 500, color: constants.colors.textLight2 }}>
              {props.username}
            </Text>
          )}
        </Box>
      </Box>
      <Box>
        {!props.connected ? (
          <AppButton
            disabled={
              props.connecting ||
              (props.hasInput &&
                props.isValidInput &&
                !props.isValidInput(inputValue))
            }
            label={props.connecting ? 'connecting' : props.buttonText}
            onClick={() => props.onButtonClicked(inputValue)}></AppButton>
        ) : (
          <Box
            direction="row"
            align="center"
            gap="4px"
            pad={{ horizontal: 'small' }}>
            <CheckIcon></CheckIcon>
            <Text
              style={{
                fontSize: '12px',
                lineHeight: '14px',
                color: '#038153',
              }}>
              Connected
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
