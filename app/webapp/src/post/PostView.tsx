import { Nanopub } from '@nanopub/sign';
import { Box, Text } from 'grommet';
import { useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { NanopubAnchor } from '../app/anchors/TwitterAnchor';
import { PLATFORM } from '../shared/types/types';
import { AppPostFull } from '../shared/types/types.posts';
import { AppButton } from '../ui-components';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { getPlatformProfile } from '../utils/post.utils';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';

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
      ? getPlatformProfile(connectedUser, post.origin, post.authorId)
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

  if (!postAuthorProfile) {
    return <Box>No Author Info Found</Box>;
  }
  if (!post) {
    return <Box>No Post Found</Box>;
  }
  return (
    <Box round="small" pad={{ horizontal: 'medium' }}>
      <PostHeader
        profileImageUrl={postAuthorProfile.profileImageUrl}
        profileName={postAuthorProfile.profileName}
        profileHandle={postAuthorProfile.profileHandle}
        datePosted={new Date(post.createdAtMs).toISOString()}
        postUrl="https://twitter.com/sense_nets_bot/status/1781581576125526151"
        prevPostId="1234"
        nextPostId="1234"
        isNanopublished={false}
        reviewStatus="For Review"></PostHeader>
      <Box pad="medium" elevation="small">
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
