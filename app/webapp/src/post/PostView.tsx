import { Box } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppFetch } from '../api/app.fetch';
import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { ViewportPage } from '../app/layout/Viewport';
import { I18Keys } from '../i18n/i18n';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID, PatternProps } from '../semantics/patterns/patterns';
import { AppPostReviewStatus } from '../shared/types/types.posts';
import { PlatformProfile } from '../shared/types/types.profiles';
import { AppButton } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useOrcidContext } from '../user-login/contexts/platforms/OrcidContext';
import { usePersist } from '../utils/use.persist';
import { PostHeader } from './PostHeader';
import { PostNav } from './PostNav';
import { PublishButtons } from './PostPublishButtons';
import { PostTextEditable } from './PostTextEditable';
import { POSTING_POST_ID } from './PostingPage';
import { usePost } from './post.context/PostContext';
import { concatenateThread, hideSemanticsHelper } from './posts.helper';

const DEBUG = false;

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: { profile?: PlatformProfile }) => {
  const appFetch = useAppFetch();

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
  const { updated, publish } = usePost();

  const postText = updated.postMerged
    ? concatenateThread(updated.postMerged.generic)
    : undefined;

  const { connectedUser } = useAccountContext();

  const { t } = useTranslation();

  const semanticsUpdated = (newSemantics: string) => {
    updated.updateSemantics(newSemantics);
  };

  const reparse = async () => {
    try {
      setIsReparsing(true);
      await appFetch('/api/posts/parse', { postId: updated.postMerged?.id });
      setIsReparsing(false);
    } catch (e: any) {
      setIsReparsing(false);
      console.error(e);
      throw new Error(e);
    }
  };

  const reviewForPublication = async () => {
    if (!updated.postMerged) {
      throw new Error(`Unexpected post not found`);
    }
    updated.updatePost({
      reviewedStatus: AppPostReviewStatus.PENDING,
    });
  };

  const enableEditOrUpdate = () => {
    if (!updated.enabledEdit) {
      updated.setEnabledEdit(true);
    } else {
      publish.publishOrRepublish();
    }
  };

  const cancelEdit = () => {
    updated.setEnabledEdit(false);
  };

  // receives the navigate from PostingPage and opens the post intent
  useEffect(() => {
    if (
      postingPostId &&
      connectedUser &&
      !justSetPostId &&
      updated.postMerged?.id
    ) {
      if (DEBUG) console.log(`posting post detected for ${postingPostId}`);
      setPostingPostId(null);
    }
  }, [postingPostId, connectedUser, justSetPostId, updated.postMerged?.id]);

  const action = (() => {
    if (
      !updated.statusesMerged.processed &&
      !updated.statusesMerged.isParsing
    ) {
      return (
        <AppButton
          margin={{ top: 'medium' }}
          icon={<Refresh color={constants.colors.text}></Refresh>}
          style={{ width: '100%' }}
          onClick={() => reparse()}
          label="Process"></AppButton>
      );
    }

    if (updated.statusesMerged.ignored) {
      return (
        <AppButton
          disabled={updated.isUpdating}
          margin={{ top: 'medium' }}
          primary
          onClick={() => reviewForPublication()}
          label={t(I18Keys.unignorePost)}></AppButton>
      );
    }

    if (updated.inPrePublish) {
      return <PublishButtons></PublishButtons>;
    }

    if (updated.statusesMerged.live && !updated.enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={updated.isUpdating || publish.isRetracting}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => publish.setUnpublishIntent(true)}
              label={t(I18Keys.unpublish)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={updated.isUpdating || publish.isRetracting}
              icon={<SendIcon></SendIcon>}
              onClick={() => enableEditOrUpdate()}
              label={t(I18Keys.edit)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    if (updated.statusesMerged.live && updated.enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" style={{ flexGrow: 1 }}>
            <AppButton
              disabled={updated.isUpdating}
              icon={<ClearIcon></ClearIcon>}
              onClick={() => cancelEdit()}
              label={t(I18Keys.cancel)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={updated.isUpdating}
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

  const editable = updated.editable;
  const hideSemantics = hideSemanticsHelper(updated.postMerged);

  const content = (() => {
    if (!updated.postMerged) {
      return (
        <Box gap="12px" pad="medium">
          <LoadingDiv height="90px" width="100%"></LoadingDiv>
          <LoadingDiv height="200px" width="100%"></LoadingDiv>
          <LoadingDiv height="120px" width="100%"></LoadingDiv>
        </Box>
      );
    }

    const patternProps: PatternProps = {
      isLoading: updated.statusesMerged.isParsing,
      editable,
      semantics: updated.postMerged?.semantics,
      originalParsed: updated.postMerged?.originalParsed,
      semanticsUpdated: semanticsUpdated,
    };

    return (
      <>
        <Box pad="medium">
          <PostHeader boxProps={{ margin: { bottom: '16px' } }}></PostHeader>
          {!hideSemantics && (
            <SemanticsEditor
              patternProps={patternProps}
              include={[PATTERN_ID.KEYWORDS]}></SemanticsEditor>
          )}

          <PostTextEditable text={postText}></PostTextEditable>

          {!hideSemantics && (
            <SemanticsEditor
              patternProps={patternProps}
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
