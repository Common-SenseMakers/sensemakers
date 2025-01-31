import { Box, Text } from 'grommet';
import { useNavigate, useParams } from 'react-router-dom';

import { ClusterIcon } from '../app/icons/ClusterIcon';
import { WorldIcon } from '../app/icons/WorldIcon';
import { AbsoluteRoutes } from '../route.names';
import { feedTabs } from '../shared/utils/feed.config';
import { AppButton } from '../ui-components';
import { ALL_CLUSTER_NAME, useCluster } from './cluster.context';

export const ClustersMenu = () => {
  const navigate = useNavigate();
  const { clustersIds } = useCluster();
  const { tabId, clusterId } = useParams();

  const onClusterSelected = (clustersId: string) => {
    navigate(AbsoluteRoutes.ClusterFeed(tabId || feedTabs[0].id, clustersId));
  };

  const allClusters = [ALL_CLUSTER_NAME].concat(clustersIds || []);

  return (
    <Box pad={{ horizontal: '16px' }} style={{ flexShrink: 0, flexGrow: 1 }}>
      {allClusters.map((cId) => {
        return (
          <AppButton
            key={cId}
            plain
            onClick={() => onClusterSelected(cId)}
            style={{ height: '38px' }}>
            <Box height={'24px'} direction="row" gap="8px" align="center">
              {cId === ALL_CLUSTER_NAME ? (
                <WorldIcon></WorldIcon>
              ) : (
                <ClusterIcon></ClusterIcon>
              )}
              <Box>
                <Text
                  style={{ fontWeight: cId === clusterId ? 'bold' : 'normal' }}>
                  {cId}
                </Text>
              </Box>
            </Box>
          </AppButton>
        );
      })}
    </Box>
  );
};
