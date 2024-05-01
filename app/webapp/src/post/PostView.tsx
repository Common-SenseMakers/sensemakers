import { Box, Text } from 'grommet';
import { useEffect, useState } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { NanopubAnchor } from '../app/anchors/TwitterAnchor';
import { PLATFORM } from '../shared/types/types';
import { AppPostFull } from '../shared/types/types.posts';
import { AppButton } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { PostContent } from './PostContent';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';

export const PostView = (props: {
  prevPostId?: string;
  nextPostId?: string;
}) => {
  const { post, nanopubDraft, nanopubPublished, author } = usePost();
  const { signNanopublication } = useNanopubContext();
  const { connectedUser } = useAccountContext();
  const { connect: connectNanopub } = useNanopubContext();
  const appFetch = useAppFetch();

  const [postEdited, setPostEdited] = useState<AppPostFull | undefined>();

  useEffect(() => {
    if (!postEdited) {
      setPostEdited(post);
    } else {
      /** merge remote changes with local changes */
      setPostEdited(post);
    }
  }, [post]);

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    signNanopublication &&
    nanopubDraft &&
    !nanopubPublished;

  const approveNanopub = async () => {
    // mark nanopub draft as approved
    const nanopub = postEdited?.mirrors.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );

    if (!nanopub || !nanopub.draft) {
      throw new Error(`Unexpected nanopub mirror not found`);
    }

    if (signNanopublication) {
      const signed = await signNanopublication(nanopub.draft.post);
      nanopub.draft.postApproval = 'approved';
      nanopub.draft.post = signed.rdf();

      await appFetch<void, AppPostFull>('/api/posts/approve', postEdited);
    }
  };

  if (!post) {
    return <LoadingDiv></LoadingDiv>;
  }

  return (
    <Box round="small" pad={{ horizontal: 'medium' }}>
      <PostHeader
        prevPostId={props.prevPostId}
        nextPostId={props.nextPostId}></PostHeader>

      <PostContent></PostContent>

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
            <NanopubAnchor href={nanopubPublished.uri}></NanopubAnchor>
          </Text>
        </Box>
      )}
      <Box>
        <Text>Please connect your nanopub credentials to publish</Text>
        <AppButton onClick={() => connectNanopub()} label="connect"></AppButton>
      </Box>
    </Box>
  );
};
