import { Box, Button, Footer, Text } from 'grommet';
import { useParams } from 'react-router-dom';

import { PostContext, usePost } from './PostContext';

export const PostView = () => {
  const { id } = useParams();
  const { post } = usePost();
  return (
    <PostContext postId={id}>
      <Box pad="medium" background="light-1" round="small" elevation="small">
        {/* Header */}
        <Box
          direction="row"
          align="center"
          gap="small"
          justify="between"
          pad={{ bottom: 'small' }}>
          <Box direction="row" align="center" gap="small">
            <Text weight="bold">{'NAME'}</Text>
            <Text color="dark-6">{'HANDLE'}</Text>
          </Box>
          <Text>{'DATE'}</Text>
        </Box>
        {/* Content */}
        <Box pad={{ vertical: 'small' }}>
          <Text>{post?.content}</Text>
        </Box>
        {/* handle rendering of semantic data below */}
        <Footer direction="row" justify="between" margin={{ top: 'medium' }}>
          <Button label="ignore" />
          <Button primary label="nanopublish" />
        </Footer>
      </Box>
    </PostContext>
  );
};
