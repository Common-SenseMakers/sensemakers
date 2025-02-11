import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';
import { useParams } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { ALL_CLUSTER_NAME } from '../posts.fetcher/cluster.context';
import { GetIndexedEntries } from '../shared/types/types.posts';
import {
  AccountProfile,
  GetClusterProfiles,
} from '../shared/types/types.profiles';
import { AppButton, AppHeading } from '../ui-components';
import { AccountProfileHeader } from './AccountProfileHeader';

export const ClusterProfiles = (props: {
  onProfileClick: (profileId: string) => void;
}) => {
  const appFetch = useAppFetch();

  const { clusterId } = useParams();
  const clusterSelected =
    clusterId !== ALL_CLUSTER_NAME ? clusterId : undefined;

  const { data: profiles } = useQuery({
    queryKey: ['clusters-profiles', clusterSelected],
    queryFn: async () => {
      try {
        const payload: GetClusterProfiles = {
          clusterId: clusterSelected,
        };
        const result = await appFetch<AccountProfile[], GetIndexedEntries>(
          '/api/profiles/getMany',
          payload
        );

        return result;
      } catch (e) {
        console.error(e);
        throw new Error((e as Error).message);
      }
    },
  });

  return (
    <Box pad="18px">
      <AppHeading level={4}>{`profiles`}</AppHeading>
      <Box gap="12px" margin={{ top: '16px' }}>
        {profiles &&
          profiles.map((profile) => {
            return (
              <AppButton
                key={profile.id}
                plain
                onClick={() => props.onProfileClick(profile.id)}>
                <AccountProfileHeader
                  size="small"
                  accounts={[profile]}></AccountProfileHeader>
              </AppButton>
            );
          })}
      </Box>
    </Box>
  );
};
