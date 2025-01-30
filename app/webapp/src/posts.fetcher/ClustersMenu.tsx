import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';

import { ClusterIcon } from '../app/icons/ClusterIcon';
import { WorldIcon } from '../app/icons/WorldIcon';
import { ClustersKeys } from '../i18n/i18n.clusters';
import { AppButton, AppHeading } from '../ui-components';
import { ALL_CLUSTER_NAME, useCluster } from './cluster.context';

export const ClustersMenu = () => {
  const { t } = useTranslation();

  const { clustersIds, select } = useCluster();
  const onClusterSelected = (clustersId: string) => {
    select(clustersId);
  };

  const allClusters = [ALL_CLUSTER_NAME].concat(clustersIds || []);

  return (
    <Box pad={{ horizontal: '16px' }}>
      <Box pad={{ vertical: '12px' }}>
        <AppHeading level="2">{t(ClustersKeys.clusters)}</AppHeading>
      </Box>
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
