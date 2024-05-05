import { Avatar, Box, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';

import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { AppPostFull } from '../shared/types/types.posts';
import { usePost } from './PostContext';

export const PostContent = () => {
  const { post } = usePost();

  const semanticsUpdated = (newSemantics: string) => {
    console.log({ newSemantics });
  };

  return (
    <Box pad={{ horizontal: 'small', vertical: 'large' }}>
      <Box elevation="small" pad="medium">
        <Text>{post?.content}</Text>
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
