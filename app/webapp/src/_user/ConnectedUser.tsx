import { Anchor, Box, DropButton, Text } from 'grommet';
import { UserExpert } from 'grommet-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAccountContext } from '../_user/contexts/AccountContext';
import { useDisconnectContext } from '../_user/contexts/DisconnectContext';
import { OrcidAnchor } from '../app/anchors/OrcidAnchor';
import { TwitterProfileAnchor } from '../app/anchors/TwitterAnchor';
import { PLATFORM } from '../shared/types/types';
import { AppButton } from '../ui-components';
import { AppAddress } from '../ui-components/AppAddress';
import { useThemeContext } from '../ui-components/ThemedApp';
import { cap } from '../utils/general';

export const ConnectedUser = (props: {}) => {
  const { t } = useTranslation();
  const { isConnected, connectedUser } = useAccountContext();

  const { constants } = useThemeContext();

  const { disconnect } = useDisconnectContext();

  const [showDrop, setShowDrop] = useState<boolean>(false);

  const nanopubDetails =
    connectedUser && connectedUser[PLATFORM.Nanopub]
      ? connectedUser[PLATFORM.Nanopub][0].profile
      : undefined;

  const twitterDetails =
    connectedUser && connectedUser[PLATFORM.Twitter]
      ? connectedUser[PLATFORM.Twitter][0].profile
      : undefined;

  const orcidDetails =
    connectedUser && connectedUser[PLATFORM.Orcid]
      ? connectedUser[PLATFORM.Orcid][0].profile
      : undefined;

  const name = useMemo(() => {
    const parts = orcidDetails ? orcidDetails.name.split(' ') : undefined;
    if (!parts) return '';
    if (parts.length > 2) return `${parts[0]} ${parts[2]}`;
    return `${parts[0]} ${parts[1]}`;
  }, [orcidDetails?.name]);

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
              {name}
            </Text>
          </Box>
        }
        open={showDrop}
        onClose={() => setShowDrop(false)}
        onOpen={() => setShowDrop(true)}
        dropContent={
          <Box pad="20px" gap="small" style={{ width: '220px' }}>
            <Box margin={{ bottom: 'small' }}>
              <Text>{cap(t('orcid'))}</Text>
              <OrcidAnchor orcid={orcidDetails?.name}></OrcidAnchor>
            </Box>

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
