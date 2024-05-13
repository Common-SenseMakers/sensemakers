import { Box, Text } from 'grommet';

import { useAppFetch } from '../api/app.fetch';
import { AppBottomNav } from '../app/layout/AppBottomNav';
import { ViewportPage } from '../app/layout/Viewport';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { PLATFORM } from '../shared/types/types';
import { PlatformPostDraftApprova } from '../shared/types/types.platform.posts';
import {
  AppPostFull,
  AppPostReviewStatus,
  PostUpdate,
} from '../shared/types/types.posts';
import { useUserPosts } from '../user-home/UserPostsContext';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { PostContent } from './PostContent';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';
import { PostNav } from './PostNav';
import { PostText } from './PostText';

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: {
  prevPostId?: string;
  nextPostId?: string;
}) => {
  const { prevPostId, nextPostId } = props;
  const { post, nanopubDraft, nanopubPublished, updateSemantics } = usePost();
  const { connectedUser } = useAccountContext();
  const { signNanopublication, connect } = useNanopubContext();
  const appFetch = useAppFetch();
  const { updatePost } = useUserPosts();

  const semanticsUpdated = (newSemantics: string) => {
    updateSemantics(newSemantics);
  };

  const reviewForPublication = async () => {
    if (!post) {
      throw new Error(`Unexpected post not found`);
    }
    updatePost(post.id, {
      reviewedStatus: AppPostReviewStatus.PENDING,
    });
  };

  const ignore = async () => {
    if (!post) {
      throw new Error(`Unexpected post not found`);
    }
    updatePost(post.id, {
      reviewedStatus: AppPostReviewStatus.IGNORED,
    });
  };

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
      nanopub.draft.postApproval = PlatformPostDraftApprova.APPROVED;
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
          <PostNav prevPostId={prevPostId} nextPostId={nextPostId}></PostNav>
          <Box pad="medium">
            <PostHeader margin={{ bottom: '16px' }}></PostHeader>
            <SemanticsEditor
              isLoading={false}
              patternProps={{
                semantics: post?.semantics,
                originalParsed: post?.originalParsed,
                semanticsUpdated: semanticsUpdated,
              }}
              include={[PATTERN_ID.KEYWORDS]}></SemanticsEditor>
            <PostText text={post?.content}></PostText>
            <SemanticsEditor
              isLoading={false}
              patternProps={{
                semantics: post?.semantics,
                originalParsed: post?.originalParsed,
                semanticsUpdated: semanticsUpdated,
              }}
              include={[PATTERN_ID.REF_LABELS]}></SemanticsEditor>
          </Box>
        </Box>
      }></ViewportPage>
  );
};
