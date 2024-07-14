import { Box } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
import { AppButton, AppHeading, AppModal } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { usePersist } from '../utils/use.persist';
import { usePost } from './PostContext';
import { PostHeader } from './PostHeader';
import { PostNav } from './PostNav';
import { PostText } from './PostText';
import { POSTING_POST_ID } from './PostingPage';
import { concatenateThread } from './posts.helper';

const DEBUG = false;

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: {
  profile?: TwitterUserProfile;
  isProfile: boolean;
}) => {
  const [approveIntent, setApproveIntent] = useState(false);
  const [askedOrcid, setAskedOrcid] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [reviewedPublished, setReviewPublished] = useState(false);

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
    setReviewPublished(false);
    setPostingPostId(null);
  };

  // reset if post changes
  useEffect(() => {
    if (post?.id) {
      reset();
    }
  }, [post?.id]);

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

  const { signNanopublication } = useNanopubContext();

  const canPublishNanopub =
    connectedUser &&
    connectedUser.nanopub &&
    connectedUser.nanopub.length > 0 &&
    signNanopublication &&
    nanopubDraft &&
    !postStatuses.nanopubPublished;

  const { action: rightClicked, label: rightLabel } = (() => {
    if (canPublishNanopub && nanopubDraft && !postStatuses.nanopubPublished) {
      return {
        action: () => setApproveIntent(true),
        label: t(I18Keys.publish),
      };
    }

    return {
      action: () => {},
      label: '',
    };
  })();

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

  const openNextPost = () => {
    if (nextPostId) {
      navigate(AbsoluteRoutes.Post(nextPostId));
    }
  };

  const openNanopublication = () => {
    console.log('openNanopublication');
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

    if (!postStatuses.nanopubPublished && !postStatuses.ignored) {
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
              disabled={isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => rightClicked()}
              label={rightLabel}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    if (enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box style={{ flexGrow: 1 }}>
            <AppButton
              disabled={isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => setEnabledEdit(false)}
              label="Cancel"></AppButton>
          </Box>
          <Box style={{ flexGrow: 1 }} align="end" gap="small">
            <AppButton
              primary
              disabled={isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => approveOrUpdate()}
              label="update"
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    return <></>;
  })();

  const askOrcid = (() => {
    return (
      <AppModal type="normal" onModalClosed={() => setApproveIntent(false)}>
        <>
          <Box width="100%" height="16px"></Box>
          <AppHeading level="1">{t(I18Keys.connectOrcidTitle)}</AppHeading>

          <Box width="100%" height="16px"></Box>
          <AppParagraph>{t(I18Keys.connectOrcidPar01)}</AppParagraph>
          <AppParagraph>
            <Trans
              i18nKey={I18Keys.connectOrcidPar02}
              components={{ b: <b></b> }}></Trans>
          </AppParagraph>

          <AppParagraph addMargin></AppParagraph>

          <Box direction="row" gap="small" margin={{ top: 'medium' }}>
            <Box width="50%" style={{ flexGrow: 1 }}>
              <AppButton
                disabled={isUpdating}
                onClick={() => connectOrcid()}
                label={t(I18Keys.connectOrcid)}></AppButton>
            </Box>
            <Box width="50%" align="end" gap="small">
              <AppButton
                primary
                disabled={isUpdating}
                onClick={() => setAskedOrcid(true)}
                label={t(I18Keys.continue)}
                style={{ width: '100%' }}></AppButton>
            </Box>
          </Box>
        </>
      </AppModal>
    );
  })();

  const finalApprove = (() => {
    return (
      <AppModal type="normal" onModalClosed={() => setApproveIntent(false)}>
        <>
          <Box width="100%" height="16px"></Box>
          <AppHeading level="1">{t(I18Keys.publishWarningTitle)}</AppHeading>

          <Box width="100%" height="16px"></Box>
          <AppParagraph>{t(I18Keys.publishWarningPar01)}</AppParagraph>
          <AppParagraph addMargin>
            <Trans
              i18nKey={I18Keys.publishWarningPar02}
              components={{ b: <b></b> }}></Trans>
          </AppParagraph>
          <AppParagraph addMargin>
            <Trans
              i18nKey={I18Keys.publishWarningPar03}
              components={{ b: <b></b> }}></Trans>
          </AppParagraph>

          <Box direction="row" gap="small" margin={{ top: 'large' }}>
            <Box width="50%" style={{ flexGrow: 1 }}>
              <AppButton
                disabled={isUpdating}
                onClick={() => reset()}
                label={t(I18Keys.returnToDraft)}></AppButton>
            </Box>
            <Box width="50%" align="end" gap="small">
              <AppButton
                primary
                disabled={isUpdating}
                onClick={() => approveClicked()}
                label={t(I18Keys.yesPublish)}
                style={{ width: '100%' }}></AppButton>
            </Box>
          </Box>
        </>
      </AppModal>
    );
  })();

  const publishingModal = (() => {
    return (
      <AppModal
        type="normal"
        onModalClosed={() => setPublishing(false)}
        windowStyle={{ flexGrow: 1 }}>
        <Box pad="medium" align="center">
          <AppHeading level="3">{t(I18Keys.publishing)}</AppHeading>
          <Box pad="24px">
            <Loading></Loading>
          </Box>
        </Box>
      </AppModal>
    );
  })();

  const publishedModal = (() => {
    return (
      <AppModal
        type="normal"
        onModalClosed={() => setReviewPublished(true)}
        windowStyle={{ backgroundColor: '#D1E8DF', flexGrow: 1 }}>
        <>
          <Box style={{ flexGrow: 1 }} justify="center">
            <Box align="center">
              <BoxCentered
                style={{
                  height: '80px',
                  width: '80px',
                  borderRadius: '40px',
                  backgroundColor: '#AECFC2',
                }}
                margin={{ bottom: '16px' }}>
                <CelebrateIcon size={40}></CelebrateIcon>
              </BoxCentered>
              <AppHeading level={3}>{t(I18Keys.publishedTitle)}</AppHeading>
              <AppParagraph style={{ marginTop: '8px', marginBottom: '24px' }}>
                <Trans
                  i18nKey={I18Keys.publishedText}
                  components={{ b: <b></b> }}></Trans>
              </AppParagraph>
            </Box>

            <Box style={{ width: '100%' }} gap="12px">
              <AppButton
                primary
                disabled={nextPostId === undefined}
                onClick={() => openNextPost()}
                label={t(I18Keys.nextPost)}
                style={{ width: '100%' }}></AppButton>
              <AppButton
                onClick={() => openNanopublication()}
                label={t(I18Keys.openPublished)}
                style={{ width: '100%' }}></AppButton>
            </Box>
          </Box>
        </>
      </AppModal>
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

  const editable = _editable && !props.isProfile;

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
            isProfile={props.isProfile}
            profile={props.profile}
            margin={{ bottom: '16px' }}></PostHeader>
          {postStatuses.isParsing ? (
            <LoadingDiv height="60px" width="100%"></LoadingDiv>
          ) : (
            <SemanticsEditor
              isLoading={false}
              patternProps={{
                editable,
                semantics: post?.semantics,
                originalParsed: post?.originalParsed,
                semanticsUpdated: semanticsUpdated,
              }}
              include={[PATTERN_ID.KEYWORDS]}></SemanticsEditor>
          )}
          <PostText text={concatenateThread(post.generic)}></PostText>
          {postStatuses.isParsing ? (
            <LoadingDiv height="120px" width="100%"></LoadingDiv>
          ) : (
            <SemanticsEditor
              isLoading={false}
              patternProps={{
                editable,
                semantics: post?.semantics,
                originalParsed: post?.originalParsed,
                semanticsUpdated: semanticsUpdated,
              }}
              include={[PATTERN_ID.REF_LABELS]}></SemanticsEditor>
          )}
          {action}
          {postStatuses.ignored ? (
            <AppButton
              disabled={isUpdating}
              margin={{ top: 'medium' }}
              primary
              onClick={() => reviewForPublication()}
              label="Review for publication"></AppButton>
          ) : (
            <></>
          )}
        </Box>
        {publishStatusModal}
      </>
    );
  })();

  return (
    <ViewportPage
      content={
        <Box fill>
          <PostNav
            isProfile={props.isProfile}
            profile={props.profile}></PostNav>
          {content}
        </Box>
      }></ViewportPage>
  );
};
