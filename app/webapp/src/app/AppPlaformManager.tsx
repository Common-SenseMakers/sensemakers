import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { AppButton, AppSectionHeader } from '../ui-components';
import { useNanopubContext } from './NanopubContext';
import { useTwitterContext } from './TwitterContext';

export const AppPlatformManager = (props: {}) => {
  const { t } = useTranslation();
  const {
    connect: connectTwitter,
    isConnecting: isConnectingTwitter,
    needAuthorize: needAuthorizeTwitter,
  } = useTwitterContext();

  const {
    connect: connectNanopub,
    isConnecting: isConnectingNanopub,
    needAuthorize: needAuthorizeNanopub,
  } = useNanopubContext();

  return (
    <Box fill pad={{ horizontal: 'medium' }} gap="small">
      <Box>
        <AppSectionHeader level="4">{t('connectNanopub')}</AppSectionHeader>
        <AppButton
          margin={{ vertical: 'small' }}
          primary
          disabled={!needAuthorizeNanopub}
          loading={isConnectingNanopub}
          onClick={() => connectNanopub()}
          label={
            needAuthorizeNanopub
              ? t('connectNanopubBtn')
              : t('nanopubConnected')
          }></AppButton>
      </Box>

      <Box margin={{ top: 'large' }}>
        <AppSectionHeader level="4">{t('connectTwitter')}</AppSectionHeader>
        <AppButton
          margin={{ vertical: 'small' }}
          primary
          disabled={!needAuthorizeTwitter}
          loading={isConnectingTwitter}
          onClick={() => connectTwitter()}
          label={
            needAuthorizeTwitter ? t('connectTwitterBn') : t('twitterConnected')
          }></AppButton>
      </Box>
    </Box>
  );
};
