import { useQuery } from '@tanstack/react-query';
import { Box } from 'grommet';

import { useAppFetch } from '../api/app.fetch';
import { KEYWORDS_COLORS } from '../semantics/patterns/keywords/Keywords.component';
import { GetIndexedEntries } from '../shared/types/types.posts';
import { AppLabelsEditor } from '../ui-components/AppLabelsEditor';

export const KeywordsSuggestions = (props: {
  onKeywordClick: (kw: string) => void;
}) => {
  const appFetch = useAppFetch();

  const { data: keywords } = useQuery({
    queryKey: ['keywords-suggestions'],
    queryFn: async () => {
      try {
        const payload: GetIndexedEntries = {
          clusterId: undefined,
          afterId: undefined,
        };
        const result = await appFetch<string[], GetIndexedEntries>(
          '/api/keywords/getMany',
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
      {keywords && (
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
