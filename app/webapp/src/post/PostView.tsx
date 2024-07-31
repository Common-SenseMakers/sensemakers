import { Box } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AppModalStandard } from '../app/AppInfoModal';
import { CelebrateIcon } from '../app/icons/CelebrateIcon';
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
import { PostTextEditable } from './PostTextEditable';
import { POSTING_POST_ID } from './PostingPage';
import { concatenateThread } from './posts.helper';

const DEBUG = false;

enum PublishPostAction {
  None = 'None',
  openNanopublication = 'openNanopublication',
  nextPost = 'nextPost',
}

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: { profile?: TwitterUserProfile }) => {
  const [approveIntent, setApproveIntent] = useState(false);
  const [askedOrcid, setAskedOrcid] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [reviewedPublished, setReviewedPublished] = useState(false);

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

  const reset = () => {
    setApproveIntent(false);
    setAskedOrcid(false);
    setPublishing(false);
    setReviewedPublished(false);
    setPostingPostId(null);
  };

  // reset if post changes
  useEffect(() => {
    if (post?.id) {
      reset();
    }
  }, [post?.id]);

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

  const ignore = async () => {
    if (!post) {
      throw new Error(`Unexpected post not found`);
    }
    updatePost({
      reviewedStatus: AppPostReviewStatus.IGNORED,
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
      setApproveIntent(true);
    }
  }, [postingPostId, connectedUser]);

  const approveClicked = () => {
    setPublishing(true);
    approveOrUpdate();
  };

  // publishing is set to false only after the nanopub status is published
  useEffect(() => {
    if (postStatuses.published) {
      setPublishing(false);
    }
  }, [postStatuses]);

  // single place to receive the last step of the publishing process
  const publishedModalClosed = (action: PublishPostAction) => {
    setJustPublished(true);

    if (action === PublishPostAction.None) {
      setReviewedPublished(true);
      return;
    }

    if (action === PublishPostAction.openNanopublication) {
      openNanopublication();
      return;
    }

    if (action === PublishPostAction.nextPost) {
      openNextPost();
      return;
    }
  };

  const openNextPost = () => {
    if (nextPostId) {
      navigate(AbsoluteRoutes.Post(nextPostId));
    }
  };

  const openNanopublication = () => {
    if (postStatuses.nanopubUrl && window) {
      const opened = window.open(postStatuses.nanopubUrl, '_blank');
      if (opened) {
        window.focus();
      }
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
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => ignore()}
              label={t(I18Keys.ignore)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={isUpdating || !readyToNanopublish}
              icon={<SendIcon></SendIcon>}
              onClick={() => setApproveIntent(true)}
              label={t(I18Keys.publish)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
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

  const askOrcid = (() => {
    return (
      <AppModalStandard
        onModalClosed={() => setApproveIntent(false)}
        type="normal"
        contentProps={{
          type: 'normal',
          title: t(I18Keys.connectOrcidTitle),
          parragraphs: [
            <Trans
              i18nKey={I18Keys.connectOrcidPar01}
              components={{ b: <b></b> }}></Trans>,
            <Trans
              i18nKey={I18Keys.connectOrcidPar02}
              components={{ b: <b></b> }}></Trans>,
          ],
          primaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.continue),
            onClick: () => setAskedOrcid(true),
          },
          secondaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.connectOrcid),
            onClick: () => connectOrcid(),
          },
        }}></AppModalStandard>
    );
  })();

  const finalApprove = (() => {
    return (
      <AppModalStandard
        onModalClosed={() => setApproveIntent(false)}
        type="normal"
        contentProps={{
          type: 'normal',
          title: t(I18Keys.publishWarningTitle),
          parragraphs: [
            <Trans
              i18nKey={I18Keys.publishWarningPar01}
              components={{ b: <b></b> }}></Trans>,
            <Trans
              i18nKey={I18Keys.publishWarningPar02}
              components={{ b: <b></b> }}></Trans>,
            <Trans
              i18nKey={I18Keys.publishWarningPar03}
              components={{ b: <b></b> }}></Trans>,
          ],
          primaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.yesPublish),
            onClick: () => approveClicked(),
          },
          secondaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.returnToDraft),
            onClick: () => reset(),
          },
        }}></AppModalStandard>
    );
  })();

  const publishingModal = (() => {
    return (
      <AppModalStandard
        onModalClosed={() => setApproveIntent(false)}
        type="normal"
        contentProps={{
          type: 'normal',
          title: t(I18Keys.publishing),
        }}></AppModalStandard>
    );
  })();

  const publishedModal = (() => {
    return (
      <AppModalStandard
        onModalClosed={() => publishedModalClosed(PublishPostAction.None)}
        backgroundColor="#D1E8DF"
        type="normal"
        contentProps={{
          icon: <CelebrateIcon size={40}></CelebrateIcon>,
          title: t(I18Keys.publishWarningTitle),
          parragraphs: [
            <Trans
              i18nKey={I18Keys.publishWarningPar01}
              components={{ b: <b></b> }}></Trans>,
            <Trans
              i18nKey={I18Keys.publishWarningPar02}
              components={{ b: <b></b> }}></Trans>,
            <Trans
              i18nKey={I18Keys.publishWarningPar03}
              components={{ b: <b></b> }}></Trans>,
          ],
          buttonsDirection: 'column',
          primaryButton: {
            disabled: nextPostId === undefined,
            label: t(I18Keys.nextPost),
            onClick: () => openNextPost(),
          },
          secondaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.openPublished),
            onClick: () => openNanopublication(),
          },
        }}></AppModalStandard>
    );
  })();

  const publishStatusModal = (() => {
    if (DEBUG)
      console.log({
        approveIntent,
        publishing,
        askedOrcid,
        orcidProfile,
        published: postStatuses.published,
        reviewedPublished,
      });

    if (approveIntent) {
      if (publishing) {
        if (DEBUG) console.log('publishingModal');
        return publishingModal;
      }

      if (!postStatuses.published) {
        if (!askedOrcid && !orcidProfile) {
          if (DEBUG) console.log('askOrcid');
          return askOrcid;
        } else {
          if (DEBUG) console.log('finalApprove');
          return finalApprove;
        }
      }

      if (!reviewedPublished) {
        if (DEBUG) console.log('publishedModal');
        return publishedModal;
      }
    }

    if (DEBUG) console.log('no modal');
    return <></>;
  })();

  if (DEBUG) console.log(publishStatusModal);

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
        {publishStatusModal}
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
