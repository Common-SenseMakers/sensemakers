import { Box, Menu, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useToastContext } from '../app/ToastsContext';
import { PostCard } from '../post/PostCard';
import {
  PostsQueryStatusParam,
  UserPostsQueryParams,
} from '../shared/types/types.posts';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { isConnected } = useAccountContext();
  const { show } = useToastContext();
  const {
    posts,
    errorFetchingOlder,
    fetchOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
  } = useUserPosts();

  useEffect(() => {
    const error = errorFetchingOlder || errorFetchingNewer;
    if (error) {
      show({
        title: 'Error getting users posts',
        message: error.message.includes('429')
          ? "Too many requests to Twitter's API. Please retry in 10-15 minutes"
          : error.message,
      });
    }
  }, [errorFetchingOlder, errorFetchingNewer]);

  const navigate = useNavigate();

  const setFilter = (filter: UserPostsQueryParams) => {
    navigate(`/${filter.status}`);
  };

  const content = posts && (
    <>
      {posts.length === 0 && (
        <BoxCentered>
          <Text>No posts found</Text>
        </BoxCentered>
      )}

      {posts.map((post, ix) => (
        <Box key={ix}>
          <PostCard post={post}></PostCard>
        </Box>
      ))}

      {posts.length > 0 && !errorFetchingOlder ? (
        <AppButton label="fetch older" onClick={() => fetchOlder()}></AppButton>
      ) : posts.length > 0 ? (
        <LoadingDiv></LoadingDiv>
      ) : (
        <> </>
      )}
    </>
  );

  const menu = (
    <Menu
      label="Menu"
      items={[
        {
          label: 'All',
          onClick: () =>
            setFilter({
              status: PostsQueryStatusParam.ALL,
              fetchParams: { expectedAmount: 10 },
            }),
        },
        {
          label: 'For Review',
          onClick: () =>
            setFilter({
              status: PostsQueryStatusParam.PENDING,
              fetchParams: { expectedAmount: 10 },
            }),
        },
        {
          label: 'Ignored',
          onClick: () =>
            setFilter({
              status: PostsQueryStatusParam.IGNORED,
              fetchParams: { expectedAmount: 10 },
            }),
        },
        {
          label: 'Published',
          onClick: () =>
            setFilter({
              status: PostsQueryStatusParam.PUBLISHED,
              fetchParams: { expectedAmount: 10 },
            }),
        },
      ]}
    />
  );

  return (
    <>
      <Box direction="row" justify="between" pad={{ horizontal: 'medium' }}>
        {menu}
        {isFetchingNewer ? (
          <Box pad="medium">
            <Loading></Loading>
          </Box>
        ) : (
          <AppButton
            icon={<Refresh></Refresh>}
            onClick={() => fetchNewer()}></AppButton>
        )}
      </Box>

      <Box
        fill
        gap="large"
        pad={{ vertical: 'large', horizontal: 'medium' }}
        justify="start">
        {content}
      </Box>
    </>
  );
};
