import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';

import { AppButton, AppCard, AppSectionHeader } from '../ui-components';
import { useNanopubContext } from './NanopubContext';
import { useTwitterContext } from './TwitterContext';

export const AppPlatformManager = (props: {}) => {
  const { t } = useTranslation();
  const {
    connect: connectTwitter,
    revoke: revokeTwitter,
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
        {!needAuthorizeTwitter ? (
          <Box>
            <AppButton
              margin={{ vertical: 'small' }}
              primary
              onClick={() => revokeTwitter()}
              label={t('revoke')}></AppButton>
            <AppCard>
              <Text>{t('revokeText')}</Text>
            </AppCard>
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};
