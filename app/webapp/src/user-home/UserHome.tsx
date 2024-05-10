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
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
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

  if (!posts) {
    return <BoxCentered>Loading...</BoxCentered>;
  }
  return (
    <>
      <Box direction="row" justify="between" pad={{ horizontal: 'medium' }}>
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

        {!errorFetchingOlder ? (
          <AppButton
            label="fetch older"
            onClick={() => fetchOlder()}></AppButton>
        ) : (
          <LoadingDiv></LoadingDiv>
        )}
      </Box>
    </>
  );
};
