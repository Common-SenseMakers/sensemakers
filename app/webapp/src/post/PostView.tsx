import { Box, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AppModalStandard } from '../app/AppModalStandard';
import { AppCheckBoxMessage } from '../app/icons/AppCheckBoxMessage';
import { CelebrateIcon } from '../app/icons/CelebrateIcon';
import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { ViewportPage } from '../app/layout/Viewport';
import { I18Keys } from '../i18n/i18n';
import { AbsoluteRoutes } from '../route.names';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { SciFilterClassfication } from '../shared/types/types.parser';
import { AppPostReviewStatus } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AppButton } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useAutopostInviteContext } from '../user-login/contexts/AutopostInviteContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { getAccount } from '../user-login/user.helper';
import { usePersist } from '../utils/use.persist';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';
import { PostNav } from './PostNav';
import { PostTextEditable } from './PostTextEditable';
import { POSTING_POST_ID } from './PostingPage';
import { concatenateThread, hideSemanticsHelper } from './posts.helper';

const DEBUG = true;

enum PublishPostAction {
  None = 'None',
  openNanopublication = 'openNanopublication',
  nextPost = 'nextPost',
}

enum PublishType {
  'publish',
  'unpublish',
}

const ORCID_INVITE_DISABLE = 'orcidInviteDisabled';

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: { profile?: TwitterUserProfile }) => {
  const [publishIntent, setPublishIntent] = useState<boolean>(false);
  const [unpublishIntent, setUnpublishIntent] = useState<boolean>(false);
  const [isUnpublishing, setIsUnpublishing] = useState<boolean>(false);

  const [orcidInviteDisabled, setOrcidInviteDisabled] = usePersist(
    ORCID_INVITE_DISABLE,
    false
  );
  const [disableOrcidInvite, setDisableOrcidInvite] = usePersist(
    ORCID_INVITE_DISABLE,
    false
  );
  const [askedOrcid, setAskedOrcid] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const { setJustPublished } = useAutopostInviteContext();

  const navigate = useNavigate();

  // shared persisted state with PostingPage.tsx
  const [postingPostId, setPostingPostId] = usePersist<string>(
    POSTING_POST_ID,
    null
  );
  // local state to prevent detecting the returning before leaving
  const [justSetPostId, setJustSetPostId] = useState<boolean>(false);

  const { connect: _connectOrcid } = useOrcidContext();

  const { constants } = useThemeContext();
  const {
    postId,
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
    retractNanopublication,
    isRetracting,
    errorApprovingMsg,
  } = usePost();

  const reset = () => {
    setPublishIntent(false);
    setUnpublishIntent(false);
    setIsUnpublishing(false);
    setAskedOrcid(false);
    setPublishing(false);
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

  const startUnpublish = () => {
    setUnpublishIntent(true);
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

  const clickedNextAfterOrcid = () => {
    if (disableOrcidInvite) {
      // disable after having cli
      setDisableOrcidInvite(true);
    }
    setAskedOrcid(true);
  };

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
      setPublishIntent(true);
    }
  }, [postingPostId, connectedUser, justSetPostId, postId]);

  const publishApproved = () => {
    setPublishing(true);
    approveOrUpdate();
  };

  const unpublishApproved = () => {
    setIsUnpublishing(true);
    retractNanopublication();
  };

  // publishing is set to false only after the nanopub status is published
  useEffect(() => {
    if (DEBUG) console.log('postStatuses', postStatuses);

    if (!unpublishIntent && postStatuses.live) {
      if (DEBUG)
        console.log(
          'postStatuses.live true setPublishing(false)',
          postStatuses
        );
      setPublishing(false);
    }

    if (postStatuses.unpublished) {
      if (DEBUG)
        console.log(
          'postStatuses.unpublished true setUnpublishIntent(false)',
          postStatuses
        );
      reset();
    }
  }, [postStatuses]);

  // single place to receive the last step of the publishing process
  const publishedModalClosed = (action: PublishPostAction) => {
    setJustPublished(true);

    if (action === PublishPostAction.None) {
      setPublishIntent(false);
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

    if (!postStatuses.live && !postStatuses.ignored) {
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
              onClick={() => setPublishIntent(true)}
              label={t(I18Keys.publish)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
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

  const askOrcid = (() => {
    return (
      <AppModalStandard
        onModalClosed={() => setPublishIntent(false)}
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
            <AppCheckBoxMessage
              message={t(I18Keys.dontShowAgain)}
              checked={disableOrcidInvite}
              onCheckChange={(value) => setDisableOrcidInvite(value)}
              size={18}></AppCheckBoxMessage>,
          ],
          primaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.continue),
            onClick: () => clickedNextAfterOrcid(),
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
        onModalClosed={() => setPublishIntent(false)}
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
          ],
          primaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.yesPublish),
            onClick: () => publishApproved(),
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
        onModalClosed={() => {
          if (errorApprovingMsg) setPublishing(false);
          setPublishIntent(false);
        }}
        type="normal"
        contentProps={{
          type: 'normal',
          title: errorApprovingMsg
            ? t(I18Keys.publishingErrorTitle)
            : t(I18Keys.publishingTitle),
          parragraphs: errorApprovingMsg
            ? [
                <Trans
                  i18nKey={I18Keys.publishingErrorPar01}
                  components={{ b: <b></b> }}></Trans>,
                <BoxCentered>
                  <Text>{errorApprovingMsg}</Text>
                </BoxCentered>,
              ]
            : [
                <Trans
                  i18nKey={I18Keys.publishingPar01}
                  components={{ b: <b></b> }}></Trans>,
                <BoxCentered>
                  <Loading></Loading>
                </BoxCentered>,
              ],
        }}></AppModalStandard>
    );
  })();

  const unpublishingModal = (() => {
    return (
      <AppModalStandard
        onModalClosed={() => setUnpublishIntent(false)}
        type="normal"
        contentProps={{
          type: 'normal',
          title: errorApprovingMsg
            ? t(I18Keys.unpublishingErrorTitle)
            : t(I18Keys.unpublishingTitle),
          parragraphs: errorApprovingMsg
            ? [
                <Trans
                  i18nKey={I18Keys.unpublishingErrorPar01}
                  components={{ b: <b></b> }}></Trans>,
                <BoxCentered>
                  <Text>{errorApprovingMsg}</Text>
                </BoxCentered>,
              ]
            : [
                <Trans
                  i18nKey={I18Keys.unpublishingPar01}
                  components={{ b: <b></b> }}></Trans>,
                <BoxCentered>
                  <Loading></Loading>
                </BoxCentered>,
              ],
        }}></AppModalStandard>
    );
  })();

  const unpublishApprove = (() => {
    return (
      <AppModalStandard
        onModalClosed={() => setUnpublishIntent(false)}
        type="normal"
        contentProps={{
          type: 'normal',
          title: t(I18Keys.unpublishWarningTitle),
          parragraphs: [
            <Trans
              i18nKey={I18Keys.unpublishWarningPar01}
              components={{ b: <b></b> }}></Trans>,
          ],
          primaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.yesUnpublish),
            onClick: () => unpublishApproved(),
          },
          secondaryButton: {
            disabled: isUpdating,
            label: t(I18Keys.returnToNanopub),
            onClick: () => reset(),
          },
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
          title: t(I18Keys.publishedTitle),
          parragraphs: [
            <Trans
              i18nKey={I18Keys.publishedText}
              components={{ b: <b></b> }}></Trans>,
          ],
          buttonsDirection: 'column',
          primaryButton: {
            disabled: nextPostId === undefined,
            label: t(I18Keys.nextPost),
            onClick: () => publishedModalClosed(PublishPostAction.nextPost),
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
        approveIntent: publishIntent,
        publishing,
        askedOrcid,
        orcidProfile,
        published: postStatuses.live,
      });

    if (publishIntent) {
      if (publishing) {
        if (DEBUG) console.log('publishingModal');
        return publishingModal;
      }

      if (!postStatuses.live) {
        if (!askedOrcid && !orcidProfile && !orcidInviteDisabled) {
          if (DEBUG) console.log('askOrcid');
          return askOrcid;
        } else {
          if (DEBUG) console.log('finalApprove');
          return finalApprove;
        }
      }

      return publishedModal;
    }

    if (DEBUG) console.log('no modal');
    return <></>;
  })();

  if (DEBUG) console.log(publishStatusModal);

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
          <PostHeader
            profile={getAccount(connectedUser, post.origin)}
            margin={{ bottom: '16px' }}></PostHeader>
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
        {publishStatusModal}
        {unpublishIntent ? (
          !isUnpublishing ? (
            unpublishApprove
          ) : (
            unpublishingModal
          )
        ) : (
          <></>
        )}
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
