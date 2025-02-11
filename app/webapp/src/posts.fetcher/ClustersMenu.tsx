import { Box, Text } from 'grommet';
import { ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ClusterIcon } from '../app/icons/ClusterIcon';
import { WorldIcon } from '../app/icons/WorldIcon';
import { AbsoluteRoutes } from '../route.names';
import { feedTabs } from '../shared/utils/feed.config';
import { AppButton, AppSelect } from '../ui-components';
import { useResponsive } from '../ui-components/ResponsiveApp';
import { ALL_CLUSTER_NAME, useCluster } from './cluster.context';

export const ClustersMenu = () => {
  const navigate = useNavigate();
  const { clustersIds } = useCluster();
  const { tabId, clusterId } = useParams();
  const { mobile } = useResponsive();

  const onClusterSelected = (clusterId: string) => {
    navigate(AbsoluteRoutes.ClusterFeed(tabId || feedTabs[0].id, clusterId));
  };

  const allClusters = [ALL_CLUSTER_NAME].concat(clustersIds || []);

  if (mobile) {
    return (
      <AppSelect
        color="white"
        style={{
          height: '38px',
          backgroundColor: 'black',
          color: 'white',
          textAlign: 'center',
        }}
        options={allClusters}
        value={clusterId}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          onClusterSelected(e.target.value)
        }></AppSelect>
    );
  }

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
