import { Box, Text } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppFetch } from '../api/app.fetch';
import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { PostEditKeys } from '../i18n/i18n.edit.post';
import { OnOverlayNav } from '../overlays/OverlayNav';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import {
  PATTERN_ID,
  PatternProps,
  PostClickEvent,
} from '../semantics/patterns/types';
import { AppButton } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { GenericThreadText } from './GenericThreadText';
import { CARD_BORDER } from './PostCard';
import { PostHeader } from './PostHeader';
import { PublishButtons } from './PostPublishButtons';
import { usePost } from './post.context/PostContext';

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: {
  isPublicFeed?: boolean;
  overlayNav?: OnOverlayNav;
  onPostClick?: (event: PostClickEvent) => void;
}) => {
  const appFetch = useAppFetch();

  const [, setIsReparsing] = useState(false);

  const { constants } = useThemeContext();
  const { updated, fetched, deleted } = usePost();

  const { connectedUser } = useAccountContext();

  const { t } = useTranslation();

  const semanticsUpdated = (newSemantics: string) => {
    updated
      .updateSemantics(newSemantics)
      .then(() => {
        /** force refetch instead of waiting for real time update */
        fetched.refetch();
      })
      .catch(console.error);
  };

  const reparse = async () => {
    try {
      setIsReparsing(true);
      await appFetch('/api/posts/parse', { postId: updated.postMerged?.id });
      setIsReparsing(false);
    } catch (e) {
      setIsReparsing(false);
      console.error(e);
    }
  };

  const enableEditOrUpdate = () => {
    if (!updated.enabledEdit) {
      updated.setEnabledEdit(true);
    }
  };

  const cancelEdit = () => {
    updated.setEnabledEdit(false);
  };

  const action = (() => {
    if (
      connectedUser &&
      updated.postMerged?.authorUserId !== connectedUser.userId
    ) {
      return <></>;
    }

    if (
      !updated.statusesMerged.processed &&
      !updated.statusesMerged.isParsing
    ) {
      return (
        <AppButton
          margin={{ top: 'medium' }}
          icon={<Refresh color={constants.colors.text}></Refresh>}
          style={{ width: '100%' }}
          onClick={() => {
            reparse().catch((e) => console.error(e));
          }}
          label="Process"></AppButton>
      );
    }

    if (updated.statusesMerged.live && !updated.enabledEdit) {
      return (
        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={updated.isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => enableEditOrUpdate()}
              label={t(PostEditKeys.edit)}
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
              label={t(PostEditKeys.cancel)}></AppButton>
          </Box>
          <Box width="50%" align="end" gap="small">
            <AppButton
              primary
              disabled={updated.isUpdating}
              icon={<SendIcon></SendIcon>}
              onClick={() => enableEditOrUpdate()}
              label={t(PostEditKeys.publish)}
              style={{ width: '100%' }}></AppButton>
          </Box>
        </Box>
      );
    }

    return <></>;
  })();

  const editable = updated.editable;
  const hideSemantics = false;

  const content = (() => {
    if (fetched.post === null) {
      return (
        <Box
          pad="medium"
          justify="center"
          align="center"
          style={{
            color: '#4B5563',
            fontFamily: 'Libre Franklin',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '16px',
            textDecorationStyle: 'solid',
            textDecorationSkipInk: 'none',
            textDecorationThickness: 'auto',
            textUnderlineOffset: 'auto',
          }}>
          <Text>Post Deleted</Text>
        </Box>
      );
    }
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
      structuredSemantics: updated.postMerged?.structuredSemantics,
      post: updated.postMerged,
      custom: { showAggregatedLabels: true },
    };
    const handlePostDelete = () => {
      if (window.confirm('Are you sure you want to delete this post?')) {
        deleted
          .deletePost()
          .then(() => {
            fetched.refetch();
          })
          .catch(console.error);
      }
    };

    return (
      <>
        <PublishButtons
          handlePostDelete={handlePostDelete}
          margin={{ bottom: '16px' }}></PublishButtons>

        <Box
          pad={{ top: 'medium', horizontal: 'medium', bottom: 'large' }}
          style={{ flexShrink: 0 }}>
          <PostHeader
            boxProps={{ margin: { bottom: '16px' } }}
            showLoading={updated.isDraft}></PostHeader>

          {!hideSemantics && (
            <SemanticsEditor
              patternProps={patternProps}
              include={[PATTERN_ID.KEYWORDS]}></SemanticsEditor>
          )}

          <GenericThreadText
            thread={updated.postMerged.generic.thread}></GenericThreadText>

          {!hideSemantics && (
            <Box margin={{ top: '24px' }}>
              <SemanticsEditor
                patternProps={{ ...patternProps }}
                include={[PATTERN_ID.REF_LABELS]}></SemanticsEditor>
            </Box>
          )}

          {action}

          <Box margin={{ top: '32px' }} direction="row" justify="end">
            <Text size="6px" color="white">
              {fetched.post?.id}
            </Text>
          </Box>
        </Box>
      </>
    );
  })();

  return (
    <Box fill>
      <Box
        style={{
          overflowY: 'auto',
          flexGrow: 1,
          border: CARD_BORDER,
        }}>
        {content}
      </Box>
    </Box>
  );
};
