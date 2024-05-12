import { Box, Text } from 'grommet';

import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { AppButton, AppCard } from '../ui-components';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { usePost } from './PostContext';
import { PostText } from './PostText';

export const PostContent = () => {
  const { post, reparse, isParsing, updateSemantics } = usePost();

  const semanticsUpdated = (newSemantics: string) => {
    updateSemantics(newSemantics);
  };

  const parsingError = post && post.parsingStatus === 'errored';

  return (
    <Box>
      <Box>
        <PostText text={post?.content}></PostText>
      </Box>

      <Box margin={{ top: 'large' }} style={{ minHeight: '90px' }}>
        {parsingError ? (
          <AppCard margin={{ vertical: 'large' }}>
            <Text>There was an error parsing this post</Text>
            <AppButton label="Retry" onClick={() => reparse()}></AppButton>
          </AppCard>
        ) : (
          <></>
        )}
        {isParsing ? <LoadingDiv fill height="120px"></LoadingDiv> : <></>}
        {post?.reviewedStatus !== 'ignored' ? (
          <SemanticsEditor
            isLoading={false}
            semantics={post?.semantics}
            originalParsed={post?.originalParsed}
            semanticsUpdated={semanticsUpdated}></SemanticsEditor>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};
