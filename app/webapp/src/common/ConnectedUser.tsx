import { Anchor, Box, DropButton, Text } from 'grommet';
import { UserExpert } from 'grommet-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAccountContext } from '../app/AccountContext';
import { AppAddress } from '../app/AppAddress';
import { useDisconnectContext } from '../app/DisconnectContext';
import { PLATFORM } from '../shared/types';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { cap } from '../utils/general';
import { OrcidAnchor } from './OrcidAnchor';
import { TwitterProfileAnchor } from './TwitterAnchor';

export const ConnectedUser = (props: {}) => {
  const { t } = useTranslation();
  const { isConnected, connect, connectedUser } = useAccountContext();

  const { constants } = useThemeContext();

  const { disconnect } = useDisconnectContext();

  const [showDrop, setShowDrop] = useState<boolean>(false);

  const nanopubDetails =
    connectedUser && connectedUser[PLATFORM.Nanopubs]
      ? connectedUser[PLATFORM.Nanopubs][0]
      : undefined;

  const twitterDetails =
    connectedUser && connectedUser[PLATFORM.Twitter]
      ? connectedUser[PLATFORM.Twitter][0]
      : undefined;

  const orcidDetails =
    connectedUser && connectedUser[PLATFORM.Orcid]
      ? connectedUser[PLATFORM.Orcid][0]
      : undefined;

  const name = useMemo(() => {
    const parts = orcidDetails ? orcidDetails.name.split(' ') : undefined;
    if (!parts) return '';
    if (parts.length > 2) return `${parts[0]} ${parts[2]}`;
    return `${parts[0]} ${parts[1]}`;
  }, [orcidDetails?.name]);

  const content = (() => {
    if (!isConnected) {
      return (
        <AppButton
          style={{ fontSize: '16px', padding: '6px 8px' }}
          label={t('connect')}
          onClick={() => connect()}></AppButton>
      );
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
              <OrcidAnchor orcid={orcidDetails?.user_id}></OrcidAnchor>
            </Box>

            {connectedUser?.twitter ? (
              <Box margin={{ bottom: 'small' }}>
                <Text>{cap(t('twitter'))}</Text>
                <TwitterProfileAnchor
                  screen_name={
                    twitterDetails?.screen_name
                  }></TwitterProfileAnchor>
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
