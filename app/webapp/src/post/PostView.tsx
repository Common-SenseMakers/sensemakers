import { Box, Text } from 'grommet';

import { useAppFetch } from '../api/app.fetch';
import { AppBottomNav } from '../app/layout/AppBottomNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PLATFORM } from '../shared/types/types';
import { AppPostFull } from '../shared/types/types.posts';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { PostContent } from './PostContent';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: {
  prevPostId?: string;
  nextPostId?: string;
}) => {
  const { prevPostId, nextPostId } = props;
  const { post, nanopubDraft, nanopubPublished } = usePost();
  const { connectedUser } = useAccountContext();
  const { signNanopublication, connect } = useNanopubContext();
  const appFetch = useAppFetch();

  const approve = async () => {
    // mark nanopub draft as approved
    const nanopub = post?.mirrors.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );

    if (!nanopub || !nanopub.draft) {
      throw new Error(`Unexpected nanopub mirror not found`);
    }

    if (signNanopublication) {
      const signed = await signNanopublication(nanopub.draft.post);
      nanopub.draft.postApproval = 'approved';
      nanopub.draft.post = signed.rdf();

      await appFetch<void, AppPostFull>('/api/posts/approve', post);
    }
  };

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    signNanopublication &&
    nanopubDraft &&
    !nanopubPublished;

  const { action: rightClicked, label: rightLabel } = (() => {
    if (nanopubPublished) {
      return {
        action: () => {
          window.open(nanopubPublished.uri, '_newtab');
        },
        label: 'published!',
      };
    }

    if (!canPublishNanopub) {
      return {
        action: () => connect(),
        label: 'connect wallet',
      };
    }

    if (canPublishNanopub && nanopubDraft && !nanopubPublished) {
      return {
        action: () => approve(),
        label: 'approve',
      };
    }

    return {
      action: () => {},
      label: '',
    };
  })();

  return (
    <ViewportPage
      content={
        <Box fill>
          <PostHeader
            prevPostId={prevPostId}
            nextPostId={nextPostId}></PostHeader>
          <Box align="center" pad="small">
            <Text size="xsmall">{post?.id}</Text>
          </Box>
          <PostContent></PostContent>
        </Box>
      }
      nav={
        <AppBottomNav
          paths={[
            { action: rightClicked, label: 'ignore' },
            { action: rightClicked, label: rightLabel },
          ]}></AppBottomNav>
      }></ViewportPage>
  );
};
