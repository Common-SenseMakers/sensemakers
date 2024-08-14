import { Box } from 'grommet';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { AppModalStandard } from '../app/AppModalStandard';
import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { I18Keys } from '../i18n/i18n';
import { AppButton } from '../ui-components';
import { AppPostReviewStatus } from '../shared/types/types.posts';


const DEBUG = false;

enum PublishPostAction {
    None = 'None',
    openNanopublication = 'openNanopublication',
    nextPost = 'nextPost',
  }

export const PostPublish = () => {
  const [approveIntent, setApproveIntent] = useState(false);
  const [askedOrcid, setAskedOrcid] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [reviewedPublished, setReviewedPublished] = useState(false);

  const ignore = async () => {
    if (!post) {
      throw new Error(`Unexpected post not found`);
    }
    updatePost({
      reviewedStatus: AppPostReviewStatus.IGNORED,
    });
  };

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

    if (action === PublishPostAction.nextPost) {
      openNextPost();
      return;
    }
  };

  const reset = () => {
    setApproveIntent(false);
    setAskedOrcid(false);
    setPublishing(false);
    setReviewedPublished(false);
    setPostingPostId(null);
  };

  const openNanopublication = () => {
    if (postStatuses.nanopubUrl && window) {
      const opened = window.open(postStatuses.nanopubUrl, '_blank');
      if (opened) {
        window.focus();
      }
    }
  };

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
    {publishStatusModal}
  );
};
