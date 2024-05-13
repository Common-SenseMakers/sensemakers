import { Box, Text } from 'grommet';

import { AppButton, AppCard } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { usePost } from './PostContext';

export const PostContent = () => {
  const { post, reparse, postStatuses } = usePost();

  const parsingError = post && post.parsingStatus === 'errored';

  return (
    <Box>
      <Box></Box>

      <Box margin={{ top: 'large' }} style={{ minHeight: '90px' }}>
        {parsingError ? (
          <AppCard margin={{ vertical: 'large' }}>
            <Text>There was an error parsing this post</Text>
            <AppButton label="Retry" onClick={() => reparse()}></AppButton>
          </AppCard>
        ) : (
          <></>
        )}
        {postStatuses.isParsing ? (
          <LoadingDiv fill height="120px"></LoadingDiv>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};
