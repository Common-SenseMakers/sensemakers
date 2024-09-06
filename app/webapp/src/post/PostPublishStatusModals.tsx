import { Text } from 'grommet';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import { AppModalStandard } from '../app/AppModalStandard';
import { AppCheckBoxMessage } from '../app/icons/AppCheckBoxMessage';
import { CelebrateIcon } from '../app/icons/CelebrateIcon';
import { I18Keys } from '../i18n/i18n';
import { AppPostReviewStatus } from '../shared/types/types.posts';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useAutopostInviteContext } from '../user-login/contexts/AutopostInviteContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { usePersist } from '../utils/use.persist';
import { usePost } from './PostContext';
import { POSTING_POST_ID } from './PostingPage';

const DEBUG = false;

enum PublishPostAction {
  None = 'None',
  openNanopublication = 'openNanopublication',
  nextPost = 'nextPost',
}

const ORCID_INVITE_DISABLE = 'orcidInviteDisabled';

export const PostPublishStatusModals = () => {
  const { setJustPublished } = useAutopostInviteContext();
  const { update, current, navigatePost, publish } = usePost();
  const { orcidProfile } = useAccountContext();

  const { connect: _connectOrcid } = useOrcidContext();

  const [publishIntent, setPublishIntent] = useState<boolean>(false);
  const [unpublishIntent, setUnpublishIntent] = useState<boolean>(false);
  const [isUnpublishing, setIsUnpublishing] = useState<boolean>(false);

  const [askedOrcid, setAskedOrcid] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [disableOrcidInvite, setDisableOrcidInvite] = usePersist(
    ORCID_INVITE_DISABLE,
    false
  );

  const [postingPostId, setPostingPostId] = usePersist<string>(
    POSTING_POST_ID,
    null
  );

  const [justSetPostId, setJustSetPostId] = useState<boolean>(false);

  const publishApproved = () => {
    setPublishing(true);
    publish.publishOrRepublish();
  };

  const unpublishApproved = () => {
    setIsUnpublishing(true);
    publish.retractNanopublication();
  };

  // publishing is set to false only after the nanopub status is published
  useEffect(() => {
    if (current.statuses.live) {
      setPublishing(false);
    }
  }, [current.statuses]);

  // single place to receive the last step of the publishing process
  const publishedModalClosed = (action: PublishPostAction) => {
    setJustPublished(true);

    if (action === PublishPostAction.None) {
      setPublishIntent(false);
      return;
    }

    if (action === PublishPostAction.nextPost) {
      navigatePost.openNextPost();
      return;
    }
  };

  const reset = () => {
    setPublishIntent(false);
    setUnpublishIntent(false);
    setIsUnpublishing(false);
    setAskedOrcid(false);
    setPublishing(false);
  };

  const openNanopublication = () => {
    if (current.statuses.nanopubUrl && window) {
      const opened = window.open(current.statuses.nanopubUrl, '_blank');
      if (opened) {
        window.focus();
      }
    }
  };

  const clickedNextAfterOrcid = () => {
    if (disableOrcidInvite) {
      // disable after having cli
      setDisableOrcidInvite(true);
    }
    setAskedOrcid(true);
  };

  const connectOrcid = () => {
    if (current.post) {
      if (DEBUG) console.log(`connectOrcid. Setting postId ${current.post.id}`);
      setPostingPostId(current.post.id);
      setJustSetPostId(true);
      _connectOrcid('/posting');
    }
  };

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
            disabled: update.isUpdating,
            label: t(I18Keys.continue),
            onClick: () => clickedNextAfterOrcid(),
          },
          secondaryButton: {
            disabled: update.isUpdating,
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
            disabled: update.isUpdating,
            label: t(I18Keys.yesPublish),
            onClick: () => publishApproved(),
          },
          secondaryButton: {
            disabled: update.isUpdating,
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
          if (publish.errorApprovingMsg) setPublishing(false);
          setPublishIntent(false);
        }}
        type="normal"
        contentProps={{
          type: 'normal',
          title: publish.errorApprovingMsg
            ? t(I18Keys.publishingErrorTitle)
            : t(I18Keys.publishingTitle),
          parragraphs: publish.errorApprovingMsg
            ? [
                <Trans
                  i18nKey={I18Keys.publishingErrorPar01}
                  components={{ b: <b></b> }}></Trans>,
                <BoxCentered>
                  <Text>{publish.errorApprovingMsg}</Text>
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
          title: publish.errorApprovingMsg
            ? t(I18Keys.unpublishingErrorTitle)
            : t(I18Keys.unpublishingTitle),
          parragraphs: publish.errorApprovingMsg
            ? [
                <Trans
                  i18nKey={I18Keys.unpublishingErrorPar01}
                  components={{ b: <b></b> }}></Trans>,
                <BoxCentered>
                  <Text>{publish.errorApprovingMsg}</Text>
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
            disabled: publish.isRetracting,
            label: t(I18Keys.yesUnpublish),
            onClick: () => unpublishApproved(),
          },
          secondaryButton: {
            disabled: publish.isRetracting,
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
            disabled: navigatePost.nextPostId === undefined,
            label: t(I18Keys.nextPost),
            onClick: () => publishedModalClosed(PublishPostAction.nextPost),
          },
          secondaryButton: {
            disabled: update.isUpdating,
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
        orcidProfile: orcidProfile,
        published: current.statuses.live,
      });

    if (publishIntent) {
      if (publishing) {
        if (DEBUG) console.log('publishingModal');
        return publishingModal;
      }

      if (!current.statuses.live) {
        if (!askedOrcid && !orcidProfile && !disableOrcidInvite) {
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

  const unPublishStatusModal = (() => {
    return unpublishIntent ? (
      !isUnpublishing ? (
        unpublishApprove
      ) : (
        unpublishingModal
      )
    ) : (
      <></>
    );
  })();

  if (DEBUG) console.log(publishStatusModal);

  return (
    <>
      {publishStatusModal}
      {unPublishStatusModal}
    </>
  );
};
