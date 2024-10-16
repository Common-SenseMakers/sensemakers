import { Text } from 'grommet';
import { t } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';

import { AppModalStandard } from '../app/AppModalStandard';
import { AppCheckBoxMessage } from '../app/icons/AppCheckBoxMessage';
import { CelebrateIcon } from '../app/icons/CelebrateIcon';
import { I18Keys } from '../i18n/i18n';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useAutopostInviteContext } from '../user-login/contexts/AutopostInviteContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { usePersist } from '../utils/use.persist';
import { POSTING_POST_ID } from './PostingPage';
import { usePost } from './post.context/PostContext';

const DEBUG = false;

enum PublishPostAction {
  None = 'None',
  openNanopublication = 'openNanopublication',
  nextPost = 'nextPost',
}

const ORCID_INVITE_DISABLE = 'orcidInviteDisabled';
const PUB_WARNING_DISABLE = 'pubWarningDisabled';

export const PostPublishStatusModals = (props: {
  showCelebration?: boolean;
}) => {
  const { setJustPublished } = useAutopostInviteContext();
  const { updated, fetched, derived, navigatePost, publish } = usePost();

  const { connectedUser } = useAccountContext();
  const { connect: _connectOrcid } = useOrcidContext();

  const orcid = connectedUser?.profiles?.orcid;

  const [isUnpublishing, setIsUnpublishing] = useState<boolean>(false);

  const [askedOrcid, setAskedOrcid] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [disableOrcidInvitePers, setDisableOrcidInvitePers] = usePersist(
    ORCID_INVITE_DISABLE,
    false
  );

  const [disableOrcidInviteLocal, setDisableOrcidInviteLocal] = useState(false);

  const [disablePubWarningPers, setDisablePubWarningPers] = usePersist(
    PUB_WARNING_DISABLE,
    false
  );

  const [disablePubWarningLocal, setDisablePubWarningLocal] = useState(false);

  useEffect(() => {
    if (DEBUG)
      console.log('useEffect disableOrcidInvitePers', {
        disableOrcidInvitePers,
        disableOrcidInviteLocal,
      });
    if (
      disableOrcidInvitePers !== null &&
      disableOrcidInvitePers !== undefined
    ) {
      setDisableOrcidInviteLocal(disableOrcidInvitePers);
    }
  }, [disableOrcidInvitePers]);

  useEffect(() => {
    if (DEBUG)
      console.log('useEffect disablePubWarningPers', {
        disablePubWarningPers,
        disablePubWarningLocal,
      });

    if (disablePubWarningPers !== null && disablePubWarningPers !== undefined) {
      setDisablePubWarningLocal(disablePubWarningPers);
    }
  }, [disablePubWarningPers]);

  const [postingPostId, setPostingPostId] = usePersist<string>(
    POSTING_POST_ID,
    null
  );

  const [justSetPostId, setJustSetPostId] = useState<boolean>(false);

  const publishApproved = () => {
    if (DEBUG) console.log(`publishApproved ${fetched.post?.id}`);

    persistPubWarnDisable();

    setPublishing(true);
    publish.publishOrRepublish();
  };

  useEffect(() => {
    if (publish.publishIntent) {
      if (disableOrcidInvitePers) {
        if (disablePubWarningPers) {
          if (DEBUG)
            console.log(`publishApproved directly ${fetched.post?.id}`);
          publishApproved();
        } else if (orcid) {
          if (DEBUG)
            console.log(`show final approve modal ${fetched.post?.id}`);
          setAskedOrcid(true);
        } else {
          if (DEBUG)
            console.log(`force show askOrcid modal ${fetched.post?.id}`);
          setAskedOrcid(false);
        }
      } else {
        if (DEBUG) console.log(`show askOrcid modal ${fetched.post?.id}`);
        setAskedOrcid(false);
      }
    }
  }, [
    publish.publishIntent,
    disableOrcidInvitePers,
    disablePubWarningPers,
    orcid,
  ]);

  const unpublishApproved = () => {
    if (DEBUG) console.log(`unpublishApproved ${fetched.postId}`);
    setIsUnpublishing(true);
    publish.retractNanopublication();
  };

  // publishing is set to false only after the nanopub status is published
  useEffect(() => {
    if (derived.statuses.live) {
      if (DEBUG) console.log(`post live ${fetched.postId}`);
      setPublishing(false);
    }
  }, [derived.statuses]);

  // single place to receive the last step of the publishing process
  const publishedModalClosed = (action: PublishPostAction) => {
    setJustPublished(true);

    if (action === PublishPostAction.None) {
      publish.setPublishIntent(false);
      return;
    }

    if (action === PublishPostAction.nextPost) {
      publish.setPublishIntent(false);
      navigatePost.openNextPost();
      return;
    }
  };

  const reset = () => {
    if (DEBUG) console.log(`reset ${fetched.postId}`);
    setDisableOrcidInviteLocal(false);
    setDisablePubWarningLocal(false);
    publish.setPublishIntent(false);
    publish.setUnpublishIntent(false);
    setIsUnpublishing(false);
    setAskedOrcid(false);
    setPublishing(false);
  };

  useEffect(() => {
    if (DEBUG) console.log(`reset due to postId change`);
    reset();
  }, [fetched.postId]);

  const openNanopublication = () => {
    if (derived.statuses.nanopubUrl && window) {
      const opened = window.open(derived.statuses.nanopubUrl, '_blank');
      if (opened) {
        window.focus();
      }
    }
  };

  const persistOrcidInviteDisable = () => {
    if (disableOrcidInviteLocal) {
      // disable after having clicked on next
      setDisableOrcidInvitePers(true);
    }
  };

  const persistPubWarnDisable = () => {
    if (disablePubWarningLocal) {
      // disable after having clicked on next
      setDisablePubWarningPers(true);
    }
  };

  const clickedNextAfterOrcid = () => {
    setAskedOrcid(true);

    /** if warning was approved just publish */
    if (disablePubWarningPers) {
      publishApproved();
    }

    persistOrcidInviteDisable();
  };

  const connectOrcid = () => {
    if (fetched.post) {
      if (DEBUG) console.log(`connectOrcid. Setting postId ${fetched.post.id}`);
      setPostingPostId(fetched.post.id);
      setJustSetPostId(true);
      _connectOrcid('/posting');
    }
  };

  if (DEBUG)
    console.log('publishModal disables', {
      disableOrcidInviteLocal,
      disableOrcidInvitePers,
      disablePubWarningLocal,
      disablePubWarningPers,
    });

  const askOrcid = (
    <AppModalStandard
      onModalClosed={() => {
        persistOrcidInviteDisable();
        publish.setPublishIntent(false);
      }}
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
        after: (
          <AppCheckBoxMessage
            message={t(I18Keys.dontShowAgain)}
            checked={disableOrcidInviteLocal}
            onCheckChange={(value) => {
              if (DEBUG)
                console.log('askOrcid disable checkbox changed', { value });
              setDisableOrcidInviteLocal(value);
            }}
            size={18}></AppCheckBoxMessage>
        ),
        primaryButton: {
          label: disablePubWarningPers
            ? t(I18Keys.publish)
            : t(I18Keys.continue),
          onClick: () => clickedNextAfterOrcid(),
        },
        secondaryButton: {
          label: t(I18Keys.connectOrcid),
          onClick: () => connectOrcid(),
        },
      }}></AppModalStandard>
  );

  const finalApprove = (
    <AppModalStandard
      onModalClosed={() => {
        persistPubWarnDisable();
        publish.setPublishIntent(false);
      }}
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
        after: (
          <AppCheckBoxMessage
            message={t(I18Keys.dontShowAgain)}
            checked={disablePubWarningLocal}
            onCheckChange={(value) => {
              if (DEBUG)
                console.log('PubWarning disable checkbox changed', { value });
              setDisablePubWarningLocal(value);
            }}
            size={18}></AppCheckBoxMessage>
        ),
        primaryButton: {
          label: t(I18Keys.yesPublish),
          onClick: () => publishApproved(),
        },
        secondaryButton: {
          label: t(I18Keys.returnToDraft),
          onClick: () => {
            persistPubWarnDisable();
            reset();
          },
        },
      }}></AppModalStandard>
  );

  const publishingModal = (
    <AppModalStandard
      onModalClosed={() => {
        if (publish.errorApprovingMsg) setPublishing(false);
        publish.setPublishIntent(false);
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

  const unpublishingModal = (
    <AppModalStandard
      onModalClosed={() => publish.setUnpublishIntent(false)}
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

  const unpublishApprove = (
    <AppModalStandard
      onModalClosed={() => publish.setUnpublishIntent(false)}
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

  const publishedModal = (
    <AppModalStandard
      onModalClosed={() => publishedModalClosed(PublishPostAction.None)}
      backgroundColor="#D1E8DF"
      type="normal"
      contentProps={{
        icon: <CelebrateIcon size={40}></CelebrateIcon>,
        title: t(I18Keys.publishedTitle),
        parragraphs: [
          <Trans
            i18nKey={I18Keys.publishedTextPar1}
            components={{ b: <b></b> }}></Trans>,
          <Trans
            i18nKey={I18Keys.publishedTextPar2}
            components={{ b: <b></b> }}></Trans>,
        ],
        buttonsDirection: 'column',
        primaryButton: {
          disabled: navigatePost.nextPostId === undefined,
          label: t(I18Keys.nextPost),
          onClick: () => publishedModalClosed(PublishPostAction.nextPost),
        },
        secondaryButton: {
          disabled: updated.isUpdating,
          label: t(I18Keys.openPublished),
          onClick: () => openNanopublication(),
        },
      }}></AppModalStandard>
  );

  const publishStatusModal = useMemo(() => {
    if (DEBUG)
      console.log(`publishStatusModal memo ${fetched.postId}`, {
        id: updated.postMerged?.id,
        publishIntent: publish.publishIntent,
        publishing,
        askedOrcid,
        orcid,
        published: derived.statuses.live,
        disableOrcidInvitePers,
        disablePubWarningPers,
      });

    if (publish.publishIntent) {
      if (publishing) {
        if (DEBUG) console.log(`publishingModal ${fetched.postId}`);
        return publishingModal;
      }

      if (!updated.statusesMerged.live) {
        if (!askedOrcid && !orcid && !disableOrcidInvitePers) {
          if (DEBUG) console.log(`askOrcid ${fetched.postId}`);
          return askOrcid;
        } else if (!disablePubWarningPers) {
          if (DEBUG) console.log(`finalApprove ${fetched.postId}`);
          return finalApprove;
        } else {
          if (DEBUG)
            console.log(
              `skipping finalApprove, publishing directly ${fetched.postId}`
            );
          publishApproved();
          return publishingModal;
        }
      } else if (props.showCelebration) {
        if (DEBUG) console.log(`publishedModal ${fetched.postId}`);
        return publishedModal;
      } else {
        publishedModalClosed(PublishPostAction.None);
      }
    }

    if (DEBUG) console.log(`no modal ${fetched.postId}`);
    return <></>;
  }, [
    updated,
    publish,
    derived,
    publishing,
    askedOrcid,
    orcid,
    disableOrcidInvitePers,
    disablePubWarningPers,
    finalApprove,
    askOrcid,
    publishedModal,
    publishingModal,
  ]);

  const unPublishStatusModal = (() => {
    return publish.unpublishIntent ? (
      !isUnpublishing ? (
        unpublishApprove
      ) : (
        unpublishingModal
      )
    ) : (
      <></>
    );
  })();

  return (
    <>
      {publishStatusModal}
      {unPublishStatusModal}
    </>
  );
};
