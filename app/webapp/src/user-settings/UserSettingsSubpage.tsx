import { Box, Paragraph } from 'grommet';

import { LeftChevronIcon } from '../app/icons/LeftChveronIcon';
import { ViewportPage } from '../app/layout/Viewport';
import { AppButton, AppHeading } from '../ui-components';

export const SettingsSubPage = (props: {
  title: string;
  subtitle: string;
  onBack: () => void;
  content: JSX.Element;
}) => {
  return (
    <ViewportPage
      content={
        <Box style={{ flexGrow: 1 }}>
          <Box>
            <AppButton
              style={{
                width: 'fit-content',
                padding: '8px 12px',
                fontWeight: 500,
              }}
              icon={
                <Box pad={{ top: '1.5px' }}>
                  <LeftChevronIcon></LeftChevronIcon>
                </Box>
              }
              plain
              label="Back"
              onClick={() => props.onBack()}></AppButton>
          </Box>

          <Box style={{ textAlign: 'center' }} margin={{ bottom: '8px' }}>
            <AppHeading level="3">{props.title}</AppHeading>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Paragraph>{props.subtitle}</Paragraph>
          </Box>

          <Box pad={{ horizontal: '16px', vertical: '24px' }}>
            {props.content}
          </Box>
        </Box>
      }></ViewportPage>
  );
};
