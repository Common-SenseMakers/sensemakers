import { Box, Menu, Text } from 'grommet';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { useToastContext } from '../app/ToastsContext';
import { PostCard } from '../post/PostCard';
import {
  PostsQueryStatusParam,
  UserPostsQueryParams,
} from '../shared/types/types.posts';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { show } = useToastContext();
  const { posts, isFetching, error, fetchOlder } = useUserPosts();
  const location = useLocation();
  const routeComponents = location.pathname.split('/');

  useEffect(() => {
    if (error) {
      show({
        title: 'Error getting users posts',
      });
    }
  }, [error]);

  const navigate = useNavigate();

  const setFilter = (filter: UserPostsQueryParams) => {
    navigate(`/${filter.status}`);
  };

  if (!posts) {
    return <BoxCentered>Loading...</BoxCentered>;
  }

  const labelFromStatusParam = (status: PostsQueryStatusParam) => {
    switch (status) {
      case PostsQueryStatusParam.ALL:
        return 'All';
      case PostsQueryStatusParam.PENDING:
        return 'For Review';
      case PostsQueryStatusParam.IGNORED:
        return 'Ignored';
      case PostsQueryStatusParam.PUBLISHED:
        return 'Published';
    }
  };

  return (
    <>
      <Menu
        label={
          routeComponents[1]
            ? labelFromStatusParam(routeComponents[1] as PostsQueryStatusParam)
            : labelFromStatusParam(PostsQueryStatusParam.ALL)
        }
        items={[
          {
            label: labelFromStatusParam(PostsQueryStatusParam.ALL),
            onClick: () =>
              setFilter({
                status: PostsQueryStatusParam.ALL,
                fetchParams: { expectedAmount: 10 },
              }),
          },
          {
            label: labelFromStatusParam(PostsQueryStatusParam.PENDING),
            onClick: () =>
              setFilter({
                status: PostsQueryStatusParam.PENDING,
                fetchParams: { expectedAmount: 10 },
              }),
          },
          {
            label: labelFromStatusParam(PostsQueryStatusParam.IGNORED),
            onClick: () =>
              setFilter({
                status: PostsQueryStatusParam.IGNORED,
                fetchParams: { expectedAmount: 10 },
              }),
          },
          {
            label: labelFromStatusParam(PostsQueryStatusParam.PUBLISHED),
            onClick: () =>
              setFilter({
                status: PostsQueryStatusParam.PUBLISHED,
                fetchParams: { expectedAmount: 10 },
              }),
          },
        ]}
      />
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

        {!isFetching ? (
          <AppButton
            label="fetch older"
            onClick={() => fetchOlder()}></AppButton>
        ) : (
          <LoadingDiv></LoadingDiv>
        )}
        {error ? <BoxCentered>{error.message}</BoxCentered> : <></>}
      </Box>
    </>
  );
};
