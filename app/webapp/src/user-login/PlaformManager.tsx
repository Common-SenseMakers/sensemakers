import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { TwitterIcon } from '../app/common/Icons';
import { I18Keys } from '../i18n/i18n';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const PlatformManager = (props: {}) => {
  const { constants } = useThemeContext();
  const { t } = useTranslation();
  const {
    connect: connectTwitter,
    isConnecting: isConnectingTwitter,
    needConnect: needConnectTwitter,
  } = useTwitterContext();

  return (
    <BoxCentered>
      <AppButton
        icon={<TwitterIcon></TwitterIcon>}
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
    </BoxCentered>
  );
};
