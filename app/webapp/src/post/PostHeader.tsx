import { Box } from 'grommet';
import {
  FormNext,
  FormNextLink,
  FormPrevious,
  FormPreviousLink,
  Home,
} from 'grommet-icons';
import { useNavigate } from 'react-router-dom';

import { AppBottomNav } from '../app/layout/AppBottomNav';
import { useUserPosts } from '../user-home/UserPostsContext';

export const PostHeader = (props: {
  prevPostId?: string;
  nextPostId?: string;
}) => {
  const { prevPostId, nextPostId } = props;
  const navigate = useNavigate();
  const { filterStatus } = useUserPosts();

  return (
    <Box style={{ height: '60px' }}>
      <AppBottomNav
        paths={[
          {
            icon: <Home></Home>,
            label: 'back',
            action: () => navigate(`/${filterStatus}`),
          },
          {
            icon: <FormPrevious></FormPrevious>,
            label: 'prev',
            disabled: !prevPostId,
            action: () => navigate(`/post/${prevPostId}`),
          },
          {
            reverse: true,
            disabled: !nextPostId,
            icon: <FormNext></FormNext>,
            label: 'next',
            action: () => navigate(`/post/${nextPostId}`),
          },
        ]}></AppBottomNav>
    </Box>
  );
};
