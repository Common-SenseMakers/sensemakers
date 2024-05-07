import { Box, Text } from 'grommet';

import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { AppButton, AppCard } from '../ui-components';
import { Loading } from '../ui-components/LoadingDiv';
import { usePost } from './PostContext';
import { PostText } from './PostText';

export const PostContent = () => {
  const { post, reparse, isReparsing } = usePost();

  const semanticsUpdated = (newSemantics: string) => {
    console.log({ newSemantics });
  };

  const parsingError = post && post.parsingStatus === 'errored';

  return (
    <Box pad={{ horizontal: 'small', vertical: 'large' }}>
      <Box elevation="small" pad="medium">
        <PostText text={post?.content}></PostText>
      </Box>
      {isReparsing ? <Loading></Loading> : <></>}
      {parsingError ? (
        <AppCard margin={{ vertical: 'medium' }}>
          <Text>There was an error parsing this post</Text>
          <AppButton label="Retry" onClick={() => reparse()}></AppButton>
        </AppCard>
      ) : (
        <></>
      )}
      <Box>
        <SemanticsEditor
          isLoading={false}
          semantics={post?.semantics}
          originalParsed={post?.originalParsed}
          semanticsUpdated={semanticsUpdated}></SemanticsEditor>
      </Box>
    </Box>
  );
};
