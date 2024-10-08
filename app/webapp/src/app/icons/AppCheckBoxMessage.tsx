import { Box, BoxExtendedProps, Text } from 'grommet';

import { AppButton } from '../../ui-components';
import { BoxCentered } from '../../ui-components/BoxCentered';

export const AppCheckBox = (props: { checked?: boolean; size?: number }) => {
  const size = props.size || 18;

  const checkedSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none">
      <rect width="18" height="18" rx="4" fill="#337FBD" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7851 5.31402C13.9568 5.47146 13.9684 5.73832 13.811 5.91007L7.62349 12.6601C7.54573 12.7449 7.43671 12.7943 7.32166 12.7968C7.20662 12.7993 7.09555 12.7547 7.01419 12.6733L4.20169 9.86081C4.03694 9.69606 4.03694 9.42894 4.20169 9.26419C4.36644 9.09944 4.63356 9.09944 4.79831 9.26419L7.29925 11.7651L13.189 5.33993C13.3465 5.16818 13.6133 5.15658 13.7851 5.31402Z"
        fill="white"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const uncheckedSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 18 18"
      fill="none">
      <rect
        x="0.75"
        y="0.75"
        width="16.5"
        height="16.5"
        rx="3.25"
        fill="white"
        stroke="#D1D5DB"
        strokeWidth="1.5"
      />
    </svg>
  );
  return <BoxCentered>{props.checked ? checkedSvg : uncheckedSvg}</BoxCentered>;
};

const DEBUG = false;

export const AppCheckBoxMessage = (props: {
  checked?: boolean;
  message: string | JSX.Element;
  onCheckChange: (value: boolean) => void;
  size?: number;
  boxProps?: BoxExtendedProps;
}) => {
  const { boxProps, message } = props;

  const clicked = () => {
    if (DEBUG) console.log('clicked', props.checked);
    props.onCheckChange(!props.checked);
  };

  console.log('checked', props.checked);

  return (
    <AppButton onClick={() => clicked()} plain>
      <Box
        direction="row"
        gap="12px"
        justify="center"
        align="center"
        {...boxProps}>
        <AppCheckBox checked={props.checked} size={props.size}></AppCheckBox>
        <Box>
          <Text size="small">{message}</Text>
        </Box>
      </Box>
    </AppButton>
  );
};
