import { Box, Text } from 'grommet';
import { useNavigate } from 'react-router-dom';

import { NavButton } from '../app/NavButton';
import { HomeIcon } from '../app/icons/HomeIcon';
import { LeftIcon } from '../app/icons/LeftIcon';
import { RightIcon } from '../app/icons/RightIcon';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useUserPosts } from '../user-home/UserPostsContext';

export const PostHeader = (props: {
  prevPostId?: string;
  nextPostId?: string;
}) => {
  const { prevPostId, nextPostId } = props;
  const navigate = useNavigate();
  const { constants } = useThemeContext();
  const { filterStatus } = useUserPosts();

  return (
    <Box
      style={{
        height: '40px',
        borderBottom: '1px solid #F3F4F6',
        backgroundColor: constants.colors.shade,
      }}
      pad={{ horizontal: '12px' }}
      direction="row"
      justify="between">
      <NavButton
        icon={<HomeIcon></HomeIcon>}
        label="Home"
        onClick={() => navigate('/')}></NavButton>
      <Box direction="row" gap="8px">
        <NavButton
          icon={<LeftIcon></LeftIcon>}
          disabled={!prevPostId}
          label="Previous"
          onClick={() => navigate(`/post/${prevPostId}`)}></NavButton>
        <NavButton
          reverse
          icon={<RightIcon></RightIcon>}
          disabled={!nextPostId}
          label="Next"
          onClick={() => navigate(`/post/${nextPostId}`)}></NavButton>
      </Box>
    </Box>
  );
};
