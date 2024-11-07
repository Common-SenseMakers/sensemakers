import { Box } from 'grommet';
import { Refresh } from 'grommet-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppFetch } from '../api/app.fetch';
import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { PostEditKeys } from '../i18n/i18n.edit.post';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID, PatternProps } from '../semantics/patterns/patterns';
import { PlatformProfile } from '../shared/types/types.profiles';
import { AppButton } from '../ui-components';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { PostHeader } from './PostHeader';
import { OnPostNav, PostNav } from './PostNav';
import { PostTextEditable } from './PostTextEditable';
import { usePost } from './post.context/PostContext';
import { concatenateThread } from './posts.helper';

/** extract the postId from the route and pass it to a PostContext */
export const PostView = (props: {
  profile?: PlatformProfile;
  onPostNav?: OnPostNav;
}) => {
  const appFetch = useAppFetch();
  const { onPostNav } = props;

  const [, setIsReparsing] = useState(false);

  const { constants } = useThemeContext();
  const { updated } = usePost();

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
      <Box
        pad={{ top: 'medium', horizontal: 'medium', bottom: 'large' }}
        style={{ flexShrink: 0 }}>
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
    );
  })();

  return (
    <Box fill>
      <PostNav onPostNav={onPostNav}></PostNav>
      <Box style={{ overflowY: 'auto', flexGrow: 1 }}>{content}</Box>
    </Box>
  );
};
