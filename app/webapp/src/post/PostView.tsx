import { Box, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
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
import { PostTextEditable } from './PostTextEditable';
import { POSTING_POST_ID } from './PostingPage';
import { concatenateThread, hideSemanticsHelper } from './posts.helper';

const DEBUG = true;

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: { profile?: TwitterUserProfile }) => {
  const navigate = useNavigate();

  // shared persisted state with PostingPage.tsx
  const [postingPostId, setPostingPostId] = usePersist<string>(
    POSTING_POST_ID,
    null
  );
  // local state to prevent detecting the returning before leaving
  const [justSetPostId, setJustSetPostId] = useState<boolean>(false);

  const [_isReparsing, setIsReparsing] = useState(false);

  const { connect: _connectOrcid } = useOrcidContext();

  const { constants } = useThemeContext();
  const { current, update, edit, publish } = usePost();

  const postText = current.post
    ? concatenateThread(current.post.generic)
    : undefined;

  const { connectedUser } = useAccountContext();

  const { t } = useTranslation();

  const semanticsUpdated = (newSemantics: string) => {
    update.updateSemantics(newSemantics);
  };

  const reviewForPublication = async () => {
    if (!current.post) {
      throw new Error(`Unexpected post not found`);
    }
    update.updatePost({
      reviewedStatus: AppPostReviewStatus.PENDING,
    });
  };

  const enableEditOrUpdate = () => {
    if (!edit.enabledEdit) {
      edit.setEnabledEdit(true);
    } else {
      publish.publishOrRepublish();
    }
  };

  const cancelEdit = () => {
    edit.setEnabledEdit(false);
  };

  const startUnpublish = () => {
    setUnpublishIntent(true);
  };

  const reparse = async () => {
    try {
      setIsReparsing(true);
      await appFetch('/api/posts/parse', { postId: post?.id });
      setIsReparsing(false);
    } catch (e: any) {
      setIsReparsing(false);
      console.error(e);
      throw new Error(e);
    }
  };

  const { signNanopublication } = useNanopubContext();

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    signNanopublication &&
    nanopubDraft;

  const readyToNanopublish =
    canPublishNanopub && nanopubDraft && !postStatuses.live;

  const connectOrcid = () => {
    if (post) {
      if (DEBUG) console.log(`connectOrcid. Setting postId ${post.id}`);
      setPostingPostId(post.id);
      setJustSetPostId(true);
      _connectOrcid('/posting');
    }
  };

  // receives the navigate from PostingPage and opens the post intent
  useEffect(() => {
    if (postingPostId && connectedUser && !justSetPostId && postId) {
      if (DEBUG) console.log(`posting post detected for ${postingPostId}`);
      setPostingPostId(null);
    }
  }, [postingPostId, connectedUser, justSetPostId, postId]);

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

    if (postStatuses.live && !enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={isUpdating || isRetracting}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => startUnpublish()}
              label={t(I18Keys.unpublish)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={isUpdating || isRetracting}
              icon={<SendIcon></SendIcon>}
              onClick={() => enableEditOrUpdate()}
              label={t(I18Keys.edit)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    if (postStatuses.live && enabledEdit) {
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
  const hideSemantics = hideSemanticsHelper(post);

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
          <PostHeader margin={{ bottom: '16px' }}></PostHeader>
          {!hideSemantics && (
            <SemanticsEditor
              patternProps={{
                isLoading: postStatuses.isParsing,
                editable,
                semantics: post?.semantics,
                originalParsed: post?.originalParsed,
                semanticsUpdated: semanticsUpdated,
              }}
              include={[PATTERN_ID.KEYWORDS]}></SemanticsEditor>
          )}

          <PostTextEditable text={postText}></PostTextEditable>

          {!hideSemantics && (
            <SemanticsEditor
              patternProps={{
                isLoading: postStatuses.isParsing,
                editable,
                semantics: post?.semantics,
                originalParsed: post?.originalParsed,
                semanticsUpdated: semanticsUpdated,
              }}
              include={[PATTERN_ID.REF_LABELS]}></SemanticsEditor>
          )}

          {action}
        </Box>
      </>
    );
  })();

  return (
    <ViewportPage
      content={
        <Box fill>
          <PostNav></PostNav>
          {content}
        </Box>
      }></ViewportPage>
  );
};
