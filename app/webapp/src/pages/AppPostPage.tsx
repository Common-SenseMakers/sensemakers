import { Nanopub } from '@nanopub/sign';
import { Box, Text } from 'grommet';
import { Add, Connect, Edit, Home, Magic, Network, Send } from 'grommet-icons';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// import { useDebounce } from 'use-debounce';
import { useAccountContext } from '../app/AccountContext';
import { useNanopubContext } from '../app/NanopubContext';
import { NANOPUBS_SERVER } from '../app/config';
import { AppBottomNav } from '../common/AppBottomNav';
import { NanopubAnchor, TweetAnchor } from '../common/TwitterAnchor';
import { ViewportPage } from '../common/Viewport';
import { getPostSemantics, postMessage } from '../functionsCalls/post.requests';
import { constructPostNanopub } from '../nanopubs/construct.post.nanopub';
import { PlatformSelector } from '../post/PlatformSelector';
import { PostEditor } from '../post/PostEditor';
import { AbsoluteRoutes } from '../route.names';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PatternProps } from '../semantics/patterns/patterns';
import { AppPostSemantics, ParserResult } from '../shared/parser.types';
import { AppPost, AppPostCreate, PLATFORM } from '../shared/types';
import {
  AppButton,
  AppCard,
  AppHeading,
  AppSectionHeader,
} from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';

const DEBUG = false;

export const AppPostPage = (props: {}) => {
  const { t } = useTranslation();
  const { constants } = useThemeContext();
  const {
    appAccessToken,
    isConnecting,
    isConnected,
    connectedUser,
    isInitializing,
  } = useAccountContext();

  const { profile } = useNanopubContext();

  /** postText is the text and is in sync with the PostEditor content */
  const [postText, setPostText] = useState<string>();
  // const [postTextDebounced] = useDebounce(postText, 10);

  const [platforms, setPlatforms] = useState<PLATFORM[]>();

  /** parsed is the parsed semantics as computed by the service */
  const [parsed, setParsed] = useState<ParserResult>();

  /** parsedModified is the semantics after the user edited them */
  const [semantics, setSemantics] = useState<AppPostSemantics>();

  const [isSending, setIsSending] = useState<boolean>();
  const [isGettingSemantics, setIsGettingSemantics] = useState<boolean>();

  const [postSentError, setPostSentError] = useState<boolean>();

  /** the published post */
  const [post, setPost] = useState<AppPost>();

  const canReRun = parsed && postText !== parsed.post;
  const hasNano =
    connectedUser !== undefined &&
    connectedUser[PLATFORM.Nanopubs] !== undefined;

  const hasTwitter =
    connectedUser !== undefined &&
    connectedUser[PLATFORM.Twitter] !== undefined;

  const hasPlatform = hasNano || hasTwitter;

  const canPost =
    hasPlatform &&
    postText &&
    platforms &&
    platforms.length &&
    !isGettingSemantics;

  // const reset = () => {
  //   setPost(undefined);
  //   setPostText(undefined);
  //   setParsed(undefined);
  //   setSemantics(undefined);
  //   setIsSending(false);
  //   setIsGettingSemantics(undefined);
  // };

  const send = useCallback(async () => {
    if (postText && appAccessToken && platforms) {
      setIsSending(true);

      let nanopubPublished: Nanopub | undefined = undefined;

      if (platforms.includes(PLATFORM.Nanopubs) && profile) {
        const _semantics = semantics || parsed?.semantics;

        if (!connectedUser) throw new Error('User not connected');
        const nanopub = await constructPostNanopub(
          postText,
          connectedUser,
          _semantics
        );
        if (DEBUG) console.log({ nanopub });

        nanopubPublished = await nanopub.publish(profile, NANOPUBS_SERVER);

        if (DEBUG)
          console.log({
            nanopubPublished: nanopubPublished?.info(),
          });
      }

      const postCreate: AppPostCreate = {
        content: postText,
        originalParsed: parsed,
        semantics: semantics,
        signedNanopub: nanopubPublished?.info(),
        platforms,
      };

      if (DEBUG) console.log('postMessage', { postCreate });
      postMessage(postCreate, appAccessToken)
        .then((post) => {
          if (post) {
            setPost(post);
            setIsSending(false);
          } else {
            setPostSentError(true);
            setIsSending(false);
          }
        })
        .catch((e) => {
          setPostSentError(true);
          setIsSending(false);
        });
    }
  }, [
    appAccessToken,
    connectedUser,
    parsed,
    platforms,
    postText,
    profile,
    semantics,
  ]);

  const canGetSemantics = postText && appAccessToken;
  const getSemantics = () => {
    if (canGetSemantics) {
      setSemantics(undefined);
      if (DEBUG) console.log('getPostMeta', { postText });
      setIsGettingSemantics(true);
      getPostSemantics(postText, appAccessToken).then((result) => {
        if (DEBUG) console.log({ result });
        setParsed(result);
        setIsGettingSemantics(false);
      });
    }
  };

  const semanticsUpdated: PatternProps['semanticsUpdated'] = (newSemantics) => {
    if (parsed) {
      if (DEBUG) console.log('semanticsUpdated', { newSemantics });
      setSemantics(newSemantics);
    }
  };

  const newPost = () => {
    // reset(); see https://github.com/vemonet/nanopub-rs/issues/5
    window.location.reload();
  };

  const content = (() => {
    if (isSending || isConnecting) {
      return <Loading></Loading>;
    }

    if (isInitializing || isConnecting) {
      return <Loading></Loading>;
    }

    if (!isConnected) {
      return (
        <AppCard>
          <Text>{t('userNotConnected')}</Text>
        </AppCard>
      );
    }

    if (post) {
      return (
        <Box gap="medium" align="center">
          <Send color={constants.colors.primary} size={'80'}></Send>
          <AppHeading level="3">{t('postSent')}</AppHeading>
          <Box margin={{ vertical: 'large' }}>
            {post.tweet ? (
              <TweetAnchor id={post.tweet?.id}></TweetAnchor>
            ) : post.signedNanopub ? (
              <NanopubAnchor href={post.signedNanopub.uri}></NanopubAnchor>
            ) : (
              <></>
            )}
          </Box>
          <AppButton
            primary
            icon={<Add color={constants.colors.textOnPrimary}></Add>}
            label={t('postNew')}
            onClick={() => newPost()}></AppButton>
        </Box>
      );
    }

    return (
      <Box width="100%" pad="medium" gap="medium">
        <Box>
          <AppSectionHeader level="4">{t('publishTo')}</AppSectionHeader>
          <PlatformSelector
            margin={{ vertical: 'medium' }}
            onChanged={setPlatforms}></PlatformSelector>
        </Box>

        <Box gap="small">
          <AppSectionHeader level="4">{t('postContent')}</AppSectionHeader>
          <PostEditor
            editable
            placeholder={t('writeYourPost')}
            onChanged={(text) => {
              setPostText(text);
              setPostSentError(false);
            }}></PostEditor>
        </Box>

        <Box margin={{ vertical: 'medium' }} gap="small">
          <AppSectionHeader level="4">{t('postSemantics')}</AppSectionHeader>
          <Box
            direction="row"
            gap="medium"
            margin={{ bottom: 'medium' }}
            style={{ minHeight: '200px' }}>
            {isGettingSemantics !== undefined ? (
              <Box fill>
                {canReRun ? (
                  <AppButton
                    disabled={isGettingSemantics}
                    margin={{ vertical: 'small' }}
                    onClick={() => getSemantics()}
                    label={semantics ? t('reset') : t('refresh')}
                    icon={
                      <Magic color={constants.colors.primary}></Magic>
                    }></AppButton>
                ) : (
                  <></>
                )}
                <Box fill pad="small">
                  <SemanticsEditor
                    id="aneditor"
                    isLoading={isGettingSemantics}
                    semantics={semantics}
                    originalParsed={parsed}
                    semanticsUpdated={semanticsUpdated}></SemanticsEditor>
                </Box>
              </Box>
            ) : (
              <BoxCentered
                fill
                style={{
                  backgroundColor: constants.colors.backgroundLight,
                  borderRadius: '8px',
                }}>
                <AppButton
                  disabled={!canGetSemantics}
                  onClick={() => getSemantics()}
                  label={t('process')}
                  icon={
                    <Magic color={constants.colors.primary}></Magic>
                  }></AppButton>
              </BoxCentered>
            )}
          </Box>
        </Box>

        <AppButton
          margin={{ bottom: 'large' }}
          disabled={!canPost}
          primary
          icon={<Send color={constants.colors.textOnPrimary}></Send>}
          onClick={() => send()}
          label={t('publish')}></AppButton>
        {postSentError ? (
          <AppCard>
            <Text>There was an error, please retry</Text>
          </AppCard>
        ) : (
          <></>
        )}
      </Box>
    );
  })();

  return (
    <ViewportPage
      content={<BoxCentered>{content}</BoxCentered>}
      nav={
        <AppBottomNav
          paths={{
            [AbsoluteRoutes.App]: {
              icon: <Network></Network>,
              label: t('socials'),
            },
            [AbsoluteRoutes.Post]: {
              icon: <Edit></Edit>,
              label: t('editor'),
            },
          }}></AppBottomNav>
      }></ViewportPage>
  );
};
