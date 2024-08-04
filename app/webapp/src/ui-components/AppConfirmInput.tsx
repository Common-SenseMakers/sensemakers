import { Box } from 'grommet';

import { AppCheckBox } from './AppCheckBox';
import { AppParagraph } from './AppParagraph';

export const AppConfirmInput = (props: { confirmText: string }) => {
  return (
    <Box direction="row" align="start" gap="12px" width="100%">
      <AppCheckBox></AppCheckBox>
      <Box>
        <AppParagraph size="small">{props.confirmText}</AppParagraph>
      </Box>
    </Box>
  );
};
