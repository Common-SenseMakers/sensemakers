import { Box } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { ViewportPage } from '../app/layout/Viewport';
import { I18Keys } from '../i18n/i18n';
import { AbsoluteRoutes } from '../route.names';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { AppPostReviewStatus } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AppButton } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useAutopostInviteContext } from '../user-login/contexts/AutopostInviteContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { usePersist } from '../utils/use.persist';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';
import { PostNav } from './PostNav';
import { PostPublish } from './PostPublish';
import { PostTextEditable } from './PostTextEditable';
import { POSTING_POST_ID } from './PostingPage';
import { concatenateThread } from './posts.helper';

const DEBUG = false;

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: { profile?: TwitterUserProfile }) => {
  const { setJustPublished } = useAutopostInviteContext();

  const navigate = useNavigate();

  // shared persisted state with PostingPage.tsx
  const [postingPostId, setPostingPostId] = usePersist<string>(
    POSTING_POST_ID,
    null
  );
  const { connect: _connectOrcid } = useOrcidContext();

  const { constants } = useThemeContext();
  const {
    post,
    nanopubDraft,
    updateSemantics,
    postStatuses,
    reparse,
    updatePost,
    isUpdating,
    approveOrUpdate,
    editable: _editable,
    enabledEdit,
    setEnabledEdit,
    nextPostId,
  } = usePost();

  const postText = post ? concatenateThread(post.generic) : undefined;

  const { connectedUser, orcidProfile } = useAccountContext();

  const { t } = useTranslation();

  const semanticsUpdated = (newSemantics: string) => {
    updateSemantics(newSemantics);
  };

  const reviewForPublication = async () => {
    if (!post) {
      throw new Error(`Unexpected post not found`);
    }
    updatePost({
      reviewedStatus: AppPostReviewStatus.PENDING,
    });
  };

  const enableEditOrUpdate = () => {
    if (!enabledEdit) {
      setEnabledEdit(true);
    } else {
      approveOrUpdate();
    }
  };

  const cancelEdit = () => {
    setEnabledEdit(false);
  };

  const retract = () => {
    console.log('retract tbd');
  };

  const { signNanopublication } = useNanopubContext();

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    signNanopublication &&
    nanopubDraft &&
    !postStatuses.published;

  const readyToNanopublish =
    canPublishNanopub && nanopubDraft && !postStatuses.published;

  const connectOrcid = () => {
    if (post) {
      setPostingPostId(post.id);
      _connectOrcid('/posting');
    }
  };

  // receives the navigate from PostingPage and opens the post intent
  useEffect(() => {
    if (postingPostId && connectedUser) {
      setPostingPostId(null);
    }
  }, [postingPostId, connectedUser]);

  const openNextPost = () => {
    if (nextPostId) {
      navigate(AbsoluteRoutes.Post(nextPostId));
    }
  };

  const action = (() => {
    if (!postStatuses.processed && !postStatuses.isParsing) {
      return (
        <AppButton
          margin={{ top: 'medium' }}
          icon={<Refresh color={constants.colors.text}></Refresh>}
          style={{ width: '100%' }}
          onClick={() => reparse()}
          label="Process"></AppButton>
      );
    }

    if (postStatuses.ignored) {
      return (
        <AppButton
          disabled={isUpdating}
          margin={{ top: 'medium' }}
          primary
          onClick={() => reviewForPublication()}
          label="Review for publication"></AppButton>
      );
    }

    if (!postStatuses.published && !postStatuses.ignored) {
      return <PostPublish></PostPublish>;
    }

    if (postStatuses.published && !enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => retract()}
              label={t(I18Keys.retract)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => enableEditOrUpdate()}
              label={t(I18Keys.edit)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    if (postStatuses.published && enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => cancelEdit()}
              label={t(I18Keys.cancel)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => enableEditOrUpdate()}
              label={t(I18Keys.publish)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    return <></>;
  })();

  const editable = _editable;

  const content = (() => {
    if (!post) {
      return (
        <Box gap="12px" pad="medium">
          <LoadingDiv height="90px" width="100%"></LoadingDiv>
          <LoadingDiv height="200px" width="100%"></LoadingDiv>
          <LoadingDiv height="120px" width="100%"></LoadingDiv>
        </Box>
      );
    }

    return (
      <>
        <Box pad="medium">
          <PostHeader
            profile={props.profile}
            margin={{ bottom: '16px' }}></PostHeader>
          <SemanticsEditor
            patternProps={{
              isLoading: postStatuses.isParsing,
              editable,
              semantics: post?.semantics,
              originalParsed: post?.originalParsed,
              semanticsUpdated: semanticsUpdated,
            }}
            include={[PATTERN_ID.KEYWORDS]}></SemanticsEditor>

          <PostTextEditable text={postText}></PostTextEditable>

          <SemanticsEditor
            patternProps={{
              isLoading: postStatuses.isParsing,
              editable,
              semantics: post?.semantics,
              originalParsed: post?.originalParsed,
              semanticsUpdated: semanticsUpdated,
            }}
            include={[PATTERN_ID.REF_LABELS]}></SemanticsEditor>

          {action}
        </Box>
      </>
    );
  })();

  return (
    <ViewportPage
      content={
        <Box fill>
          <PostNav profile={props.profile}></PostNav>
          {content}
        </Box>
      }></ViewportPage>
  );
};
