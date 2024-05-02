import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { I18Keys } from '../i18n/i18n';
import { AppButton } from '../ui-components';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const PlatformManager = (props: {}) => {
  const { t } = useTranslation();
  const {
    connect: connectTwitter,
    isConnecting: isConnectingTwitter,
    needConnect: needConnectTwitter,
  } = useTwitterContext();

  return (
    <Box fill>
      <Box align="center">
        <AppButton
          style={{ width: '50%' }}
          primary
          disabled={!needConnectTwitter}
          isLoading={isConnectingTwitter}
          onClick={() => {
            if (connectTwitter) {
              connectTwitter('read');
            }
          }}
          label={t(I18Keys.connectTwitterBtn)}></AppButton>
      </Box>
    </Box>
  );
};
