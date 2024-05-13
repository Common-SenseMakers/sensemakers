import { Box, Text } from 'grommet';
import { Clear, FormClose, Refresh, Send } from 'grommet-icons';

import { useAppFetch } from '../api/app.fetch';
import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
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
import { AppButton } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useUserPosts } from '../user-home/UserPostsContext';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';
import { PostNav } from './PostNav';
import { PostText } from './PostText';

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: {
  prevPostId?: string;
  nextPostId?: string;
}) => {
  const { constants } = useThemeContext();
  const { prevPostId, nextPostId } = props;
  const { post, nanopubDraft, updateSemantics, status, reparse } = usePost();
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
    !status.nanopubPublished;

  const { action: rightClicked, label: rightLabel } = (() => {
    if (!canPublishNanopub) {
      return {
        action: () => connect(),
        label: 'Connect',
      };
    }

    if (canPublishNanopub && nanopubDraft && !status.nanopubPublished) {
      return {
        action: () => approve(),
        label: 'Nanopublish',
      };
    }

    return {
      action: () => {},
      label: '',
    };
  })();

  const action = (() => {
    if (!status.processed && !status.isParsing) {
      return (
        <AppButton
          margin={{ top: 'medium' }}
          icon={<Refresh color={constants.colors.text}></Refresh>}
          style={{ width: '100%' }}
          onClick={() => reparse()}
          label="Process"></AppButton>
      );
    }

    if (!status.nanopubPublished && !status.ignored) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <AppButton
            icon={<ClearIcon></ClearIcon>}
            style={{ width: '50%' }}
            onClick={() => ignore()}
            label="Ignore"></AppButton>
          <AppButton
            primary
            icon={<SendIcon></SendIcon>}
            style={{ width: '50%' }}
            onClick={() => rightClicked()}
            label={rightLabel}></AppButton>
        </Box>
      );
    }
    return <></>;
  })();

  const content = (() => {
    if (!post) {
      return (
        <Box gap="12px" pad="medium">
          <LoadingDiv height="90px" width="100%"></LoadingDiv>
          <LoadingDiv height="200px" width="100%"></LoadingDiv>
          <LoadingDiv height="120px" width="100%"></LoadingDiv>;
        </Box>
      );
    }

    return (
      <>
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
          {action}
          {status.ignored ? (
            <AppButton
              margin={{ top: 'medium' }}
              primary
              onClick={() => reviewForPublication()}
              label="Review for publication"></AppButton>
          ) : (
            <></>
          )}
        </Box>
      </>
    );
  })();

  return (
    <ViewportPage
      content={
        <Box fill>
          <PostNav prevPostId={prevPostId} nextPostId={nextPostId}></PostNav>
          {content}
        </Box>
      }></ViewportPage>
  );
};
