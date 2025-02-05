import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';
import { useParams } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { ALL_CLUSTER_NAME } from '../posts.fetcher/cluster.context';
import { KEYWORDS_COLORS } from '../semantics/patterns/keywords/Keywords.component';
import { GetIndexedEntries } from '../shared/types/types.posts';
import { AppLabelsEditor } from '../ui-components/AppLabelsEditor';

export const ClusterProfiles = (props: {
  onKeywordClick: (kw: string) => void;
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
        const result = await appFetch<string[], GetIndexedEntries>(
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
      {profiles && (
        <AppLabelsEditor
          onLabelClick={(label) => props.onKeywordClick(label)}
          underline
          colors={KEYWORDS_COLORS}
          labels={keywords}
          placeholder={''}></AppLabelsEditor>
      )}
    </Box>
  );
};
