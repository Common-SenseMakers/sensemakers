import { Box, CheckBox } from 'grommet';

import { AppParagraph } from './AppParagraph';

export const AppConfirmInput = (props: { confirmText: string }) => {
  return (
    <Box direction="row" align="start" gap="12px" width="100%">
      <CheckBox></CheckBox>
      <Box>
        <AppParagraph size="small">{props.confirmText}</AppParagraph>
      </Box>
    </Box>
  );
};
