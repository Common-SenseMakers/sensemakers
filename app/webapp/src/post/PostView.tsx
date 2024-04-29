import { Nanopub } from '@nanopub/sign';
import { Box, Footer, Text } from 'grommet';
import { FormPrevious } from 'grommet-icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserV2 } from 'twitter-api-v2';

import { useAppFetch } from '../api/app.fetch';
import { NanopubAnchor } from '../app/anchors/TwitterAnchor';
import { AbsoluteRoutes } from '../route.names';
import { PLATFORM } from '../shared/types/types';
import { AppPostFull } from '../shared/types/types.posts';
import { AppButton } from '../ui-components';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { getPlatformProfile } from '../utils/post.utils';
import { usePost } from './PostContext';

export const PostView = () => {
  const { post } = usePost();
  const { connectedUser } = useAccountContext();
  const { connect: connectNanopub } = useNanopubContext();
  const appFetch = useAppFetch();

  const [postEdited, setPostEdited] = useState<AppPostFull | undefined>();

  useEffect(() => {
    if (!postEdited) {
      setPostEdited(post);
    } else {
      console.warn('Post edited', postEdited);
    }
  }, [post]);

  const postAuthorProfile =
    connectedUser && post
      ? (getPlatformProfile(
          connectedUser,
          post.origin,
          post.authorId
        ) as UserV2)
      : undefined;

  const nanopubPublished = useMemo(() => {
    const nanopub = post?.mirrors.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );
    if (!nanopub) return undefined;

    const nanopubObj = new Nanopub(nanopub.posted);
    return nanopubObj;
  }, [post]);

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    !nanopubPublished;

  const approveNanopub = async () => {
    // mark nanopub draft as approved
    const nanopub = postEdited?.mirrors.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );

    if (!nanopub || !nanopub.draft) {
      throw new Error(`Unexpected nanopub mirror not found`);
    }
    nanopub.draft.postApproval = 'approved';

    await appFetch<void, AppPostFull>('/api/posts/approve', postEdited);
  };

  const navigate = useNavigate();
  return (
    <Box round="small" pad={{ horizontal: 'medium' }}>
      {/* Header */}
      <Box margin={{ vertical: 'large' }}>
        <AppButton
          icon={<FormPrevious></FormPrevious>}
          label="back"
          onClick={() => navigate(AbsoluteRoutes.App)}></AppButton>
      </Box>
      <Box pad="medium" elevation="small">
        <Box
          direction="row"
          align="center"
          gap="small"
          justify="between"
          background="light-1">
          <Box direction="row" align="center" gap="small">
            <Text weight="bold">{postAuthorProfile?.name}</Text>
            <Text color="dark-6">{postAuthorProfile?.username}</Text>
          </Box>
          <Text>{post?.createdAtMs}</Text>
        </Box>
        {/* Content */}
        <Box pad={{ vertical: 'small' }}>
          <Text>{post?.content}</Text>
        </Box>
        <Box>
          <Text size="xsmall">{post?.semantics}</Text>
        </Box>
        {/* handle rendering of semantic data below */}
        {!nanopubPublished ? (
          <Box direction="row" justify="between" margin={{ top: 'medium' }}>
            <AppButton label="ignore" />
            <AppButton
              primary
              label="nanopublish"
              disabled={!canPublishNanopub}
              onClick={() => approveNanopub()}
            />
          </Box>
        ) : (
          <Box>
            <Text>
              Nanopublication published{' '}
              <NanopubAnchor href={nanopubPublished.info().uri}></NanopubAnchor>
            </Text>
          </Box>
        )}
        <Box>
          <Text>Please connect your nanopub credentials to publish</Text>
          <AppButton
            onClick={() => connectNanopub()}
            label="connect"></AppButton>
        </Box>
      </Box>
    </Box>
  );
};
