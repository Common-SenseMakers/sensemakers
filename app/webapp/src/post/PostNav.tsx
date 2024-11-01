import { Box } from 'grommet';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavButton } from '../app/NavButton';
import { LeftChevronIcon } from '../app/icons/LeftChveronIcon';
import { LeftIcon } from '../app/icons/LeftIcon';
import { RightIcon } from '../app/icons/RightIcon';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useUserPosts } from '../user-home/UserPostsContext';
import { useNavigationHistory } from '../user-login/contexts/NavHistoryContext';
import { usePost } from './post.context/PostContext';

const DEBUG = false;

export const PostNav = () => {
  const { fetched, navigatePost } = usePost();

  const { feed } = useUserPosts();
  const { fetchOlder, isFetchingOlder, errorFetchingOlder } = feed;
  const [triggeredFetchOlder, setTriggeredFetchedOlder] = useState(false);

  const navigate = useNavigate();
  const { hasHistory } = useNavigationHistory();
  const { constants } = useThemeContext();

  useEffect(() => {
    if (
      !navigatePost.nextPostId &&
      !isFetchingOlder &&
      !errorFetchingOlder &&
      !triggeredFetchOlder
    ) {
      setTriggeredFetchedOlder(true);
      if (DEBUG)
        console.log('fetching older', {
          nextPostId: navigatePost.nextPostId,
          isFetchingOlder,
          errorFetchingOlder,
          triggeredFetchOlder,
        });

      fetchOlder();
    }

    /** reset triggeredFetchedOlder once the nextPostId was obtained */
    if (navigatePost.nextPostId) {
      setTriggeredFetchedOlder(false);
    }
  }, [
    errorFetchingOlder,
    isFetchingOlder,
    navigatePost.nextPostId,
    triggeredFetchOlder,
  ]);

  const goToPrev = () => {
    navigate(`/post/${navigatePost.prevPostId}`);
  };

  const goToNext = () => {
    if (navigatePost.nextPostId) {
      navigate(`/post/${navigatePost.nextPostId}`);
    }
  };

  if (DEBUG)
    console.log('PostNav', {
      nextPostId: navigatePost.nextPostId,
      prevPostId: navigatePost.prevPostId,
    });

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
        onClick={() => {
          if (hasHistory) navigate(-1);
          else navigate('..', { state: { postId: fetched.postId } });
        }}></NavButton>

      <Box direction="row" gap="8px">
        <NavButton
          icon={<LeftIcon></LeftIcon>}
          disabled={!navigatePost.prevPostId}
          label="Previous"
          onClick={() => goToPrev()}></NavButton>
        <NavButton
          reverse
          icon={
            <Box justify="center" style={{ width: '22px' }}>
              {isFetchingOlder ? (
                <Loading size="16px"></Loading>
              ) : (
                <RightIcon></RightIcon>
              )}
            </Box>
          }
          disabled={!navigatePost.nextPostId}
          label="Next"
          onClick={() => goToNext()}></NavButton>
      </Box>
    </Box>
  );
};
