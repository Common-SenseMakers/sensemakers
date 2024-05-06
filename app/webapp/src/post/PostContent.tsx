import { Box, Markdown } from 'grommet';

import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { usePost } from './PostContext';
import { PostText } from './PostText';

export const PostContent = () => {
  const { post } = usePost();

  const semanticsUpdated = (newSemantics: string) => {
    console.log({ newSemantics });
  };

  return (
    <Box pad={{ horizontal: 'small', vertical: 'large' }}>
      <Box elevation="small" pad="medium">
        <PostText text={post?.content}></PostText>
      </Box>
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
