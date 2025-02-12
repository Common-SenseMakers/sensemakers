import { Box, Text } from 'grommet';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { ClusterIcon, ClusterIconSelected } from '../app/icons/ClusterIcon';
import { WorldIcon } from '../app/icons/WorldIcon';
import { ClustersKeys } from '../i18n/i18n.clusters';
import { AbsoluteRoutes } from '../route.names';
import { feedTabs } from '../shared/utils/feed.config';
import { AppButton, AppHeading, AppSelect } from '../ui-components';
import { useResponsive } from '../ui-components/ResponsiveApp';
import { useThemeContext } from '../ui-components/ThemedApp';
import { ALL_CLUSTER_NAME, useCluster } from './cluster.context';

export const ClustersMenu = () => {
  const { t } = useTranslation();
  const { constants } = useThemeContext();
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
    <Box style={{ flexShrink: 0, flexGrow: 1 }}>
      <Box margin={{ bottom: '20px' }}>
        <AppHeading level="3">{t(ClustersKeys.clusters)}</AppHeading>
      </Box>
      <Box gap="12px" pad={{ left: '12px' }}>
        {allClusters.map((cId) => {
          const isSelected = cId === clusterId;
          return (
            <AppButton key={cId} plain onClick={() => onClusterSelected(cId)}>
              <Box height={'24px'} direction="row" gap="8px" align="center">
                {cId === ALL_CLUSTER_NAME ? (
                  <WorldIcon></WorldIcon>
                ) : isSelected ? (
                  <ClusterIconSelected></ClusterIconSelected>
                ) : (
                  <ClusterIcon></ClusterIcon>
                )}
                <Box>
                  <Text
                    style={{
                      color: isSelected
                        ? constants.colors.primary
                        : constants.colors.textLight,
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: '500',
                      lineHeight: '20px; /* 142.857% */',
                      textDecorationLine: 'underline',
                      textDecorationStyle: 'solid',
                      textDecorationSkipInk: 'none',
                      textDecorationThickness: 'auto',
                      textUnderlineOffset: 'auto',
                      textUnderlinePosition: 'from-font',
                      textWrap: 'nowrap',
                    }}>
                    {cId}
                  </Text>
                </Box>
              </Box>
            </AppButton>
          );
        })}
      </Box>
    </Box>
  );
};
