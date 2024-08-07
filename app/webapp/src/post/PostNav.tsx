import { Box } from 'grommet';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavButton } from '../app/NavButton';
import { LeftChevronIcon } from '../app/icons/LeftChveronIcon';
import { LeftIcon } from '../app/icons/LeftIcon';
import { RightIcon } from '../app/icons/RightIcon';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useUserPosts } from '../user-home/UserPostsContext';
import { usePost } from './PostContext';

export const PostNav = (props: { profile?: TwitterUserProfile }) => {
  const profile = props.profile;
  const { post, nextPostId, prevPostId } = usePost();

  const { fetchOlder, isFetchingOlder, errorFetchingOlder } = useUserPosts();

  const navigate = useNavigate();
  const { constants } = useThemeContext();

  useEffect(() => {
    if (!nextPostId && !isFetchingOlder && !errorFetchingOlder) {
      console.log('fetching older');
      fetchOlder();
    }
  }, [isFetchingOlder, nextPostId]);

  const goToPrev = () => {
    navigate(`/post/${prevPostId}`);
  };

  const goToNext = () => {
    if (nextPostId) {
      navigate(`/post/${nextPostId}`);
    }
  };

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
        icon={<LeftChevronIcon></LeftChevronIcon>}
        label={'Back'}
        onClick={() =>
          profile
            ? navigate('..', { state: { postId: post?.id } })
            : navigate('/')
        }></NavButton>

      <Box direction="row" gap="8px">
        <NavButton
          icon={<LeftIcon></LeftIcon>}
          disabled={!prevPostId}
          label="Previous"
          onClick={() => goToPrev()}></NavButton>
        <NavButton
          reverse
          icon={
            isFetchingOlder ? (
              <Loading size="16px"></Loading>
            ) : (
              <RightIcon></RightIcon>
            )
          }
          disabled={!nextPostId}
          label="Next"
          onClick={() => goToNext()}></NavButton>
      </Box>
    </Box>
  );
};
