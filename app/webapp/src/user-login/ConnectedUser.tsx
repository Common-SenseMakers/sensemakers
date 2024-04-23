import { Anchor, Box, DropButton, Text } from 'grommet';
import { UserExpert } from 'grommet-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TwitterProfileAnchor } from '../app/anchors/TwitterAnchor';
import { PLATFORM } from '../shared/types/types';
import { AppButton } from '../ui-components';
import { AppAddress } from '../ui-components/AppAddress';
import { useThemeContext } from '../ui-components/ThemedApp';
import { cap } from '../utils/general';
import { useAccountContext } from './contexts/AccountContext';
import { useDisconnectContext } from './contexts/DisconnectContext';

export const ConnectedUser = (props: {}) => {
  const { t } = useTranslation();
  const { isConnected, connectedUser } = useAccountContext();

  const { constants } = useThemeContext();

  const { disconnect } = useDisconnectContext();

  const [showDrop, setShowDrop] = useState<boolean>(false);

  const nanopubDetails =
    connectedUser && connectedUser[PLATFORM.Nanopub]?.length
      ? connectedUser[PLATFORM.Nanopub][0].profile
      : undefined;

  const twitterDetails =
    connectedUser && connectedUser[PLATFORM.Twitter]?.length
      ? connectedUser[PLATFORM.Twitter][0].profile
      : undefined;

  const content = (() => {
    if (!isConnected) {
      return <></>;
    }

    return (
      <DropButton
        pad="small"
        label={
          <Box direction="row" align="center">
            <UserExpert
              color={constants.colors.primary}
              style={{ margin: '2px 0px 0px 5px' }}></UserExpert>
            <Text margin={{ left: 'small' }} style={{ flexShrink: 0 }}>
              {twitterDetails?.username}
            </Text>
          </Box>
        }
        open={showDrop}
        onClose={() => setShowDrop(false)}
        onOpen={() => setShowDrop(true)}
        dropContent={
          <Box pad="20px" gap="small" style={{ width: '220px' }}>
            {connectedUser?.twitter ? (
              <Box margin={{ bottom: 'small' }}>
                <Text>{cap(t('twitter'))}</Text>
                <TwitterProfileAnchor
                  screen_name={twitterDetails?.username}></TwitterProfileAnchor>
              </Box>
            ) : (
              <></>
            )}

            {nanopubDetails ? (
              <Box margin={{ bottom: 'small' }}>
                <Text>{cap(t('nanopubSigner'))}</Text>
                <AppAddress address={nanopubDetails.ethAddress}></AppAddress>
                <Anchor
                  style={{}}
                  target="_blank"
                  href={`${nanopubDetails.introNanopub}`}
                  size="small">
                  {t('introPub')}
                </Anchor>
              </Box>
            ) : (
              <></>
            )}

            <AppButton
              plain
              onClick={() => disconnect()}
              style={{ textTransform: 'none', paddingTop: '6px' }}>
              <Text style={{ fontWeight: 'bold' }}>{cap(t('logout'))}</Text>
            </AppButton>
          </Box>
        }
        dropProps={{
          style: { marginTop: '3px' },
          align: { top: 'bottom' },
        }}></DropButton>
    );
  })();

  return (
    <Box style={{ height: '60px' }} align="center" justify="center">
      {content}
    </Box>
  );
};
