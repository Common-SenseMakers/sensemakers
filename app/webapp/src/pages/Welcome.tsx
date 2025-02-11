import { Box, Image } from 'grommet';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ALL_CLUSTER_NAME } from '../posts.fetcher/cluster.context';
import { AbsoluteRoutes } from '../route.names';
import { AppParagraph } from '../ui-components/AppParagraph';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';

interface WelcomeBulletProps {
  emoji: string;
  translationKey: string;
}

export const WelcomeBullet = ({
  emoji,
  translationKey,
}: WelcomeBulletProps) => {
  return (
    <Box
      direction="row"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '8px',
        alignSelf: 'stretch',
      }}>
      <Box
        style={{
          height: '32px',
          width: '32px',
        }}>
        <Image src={emoji}></Image>
      </Box>
      <AppParagraph
        style={{
          flex: '1 0 0',
        }}>
        <Trans i18nKey={translationKey} components={{ b: <b></b> }}></Trans>
      </AppParagraph>
    </Box>
  );
};

export const Welcome = () => {
  const navigate = useNavigate();

  /** after the signin flow, the connectedUser should be defined */
  useEffect(() => {
    navigate(AbsoluteRoutes.ClusterFeed(ALL_CLUSTER_NAME));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BoxCentered>
      <Loading />
    </BoxCentered>
  );
};
