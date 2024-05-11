import { Box, BoxExtendedProps, DropButton, Menu, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useToastContext } from '../app/ToastsContext';
import { I18Keys } from '../i18n/i18n';
import { PostCard } from '../post/PostCard';
import { PostsQueryStatus, UserPostsQuery } from '../shared/types/types.posts';
import {
  AppButton,
  AppHeading,
  AppSelect,
  SelectValue,
} from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useUserPosts } from './UserPostsContext';

export const UserHome = () => {
  const { t } = useTranslation();
  const { show } = useToastContext();

  const {
    filterStatus,
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

  const setFilter = (filter: UserPostsQuery) => {
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

  const FilterValue = (
    props: {
      status: PostsQueryStatus;
    } & BoxExtendedProps
  ) => {
    return (
      <SelectValue style={{ padding: '6px 16px' }}>
        <Box>{props.status}</Box>
      </SelectValue>
    );
  };

  const options: PostsQueryStatus[] = [
    PostsQueryStatus.ALL,
    PostsQueryStatus.PENDING,
    PostsQueryStatus.PUBLISHED,
    PostsQueryStatus.IGNORED,
  ];

  const menu = (
    <AppSelect
      value={
        filterStatus ? (
          <FilterValue status={filterStatus}></FilterValue>
        ) : (
          <FilterValue status={PostsQueryStatus.ALL}></FilterValue>
        )
      }
      options={options}
      onChange={(e) =>
        setFilter({
          status: e.target.value,
          fetchParams: { expectedAmount: 10 },
        })
      }>
      {(status) => {
        return <FilterValue status={status}></FilterValue>;
      }}
    </AppSelect>
  );

  const header = (
    <Box>
      <Box direction="row">
        <AppHeading level="3">{t(I18Keys.yourPublications)}</AppHeading>
      </Box>

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
  );

  return (
    <>
      {header}

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
