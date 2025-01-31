import { Box, Text } from 'grommet';

import { ClusterIcon } from '../app/icons/ClusterIcon';
import { WorldIcon } from '../app/icons/WorldIcon';
import { AppButton } from '../ui-components';
import { ALL_CLUSTER_NAME, useCluster } from './cluster.context';

export const ClustersMenu = () => {
  const { clustersIds, select } = useCluster();
  const onClusterSelected = (clustersId: string) => {
    select(clustersId);
  };

  const allClusters = [ALL_CLUSTER_NAME].concat(clustersIds || []);

  return (
    <Box pad={{ horizontal: '16px' }} style={{ flexShrink: 0, flexGrow: 1 }}>
      {allClusters.map((clusterId) => {
        return (
          <AppButton plain onClick={() => onClusterSelected(clusterId)}>
            <Box height={'24px'} direction="row" gap="8px" align="center">
              {clusterId === ALL_CLUSTER_NAME ? (
                <WorldIcon></WorldIcon>
              ) : (
                <ClusterIcon></ClusterIcon>
              )}
              <Box>
                <Text>{clusterId}</Text>
              </Box>
            </Box>
          </AppButton>
        );
      })}
    </Box>
  );
};
