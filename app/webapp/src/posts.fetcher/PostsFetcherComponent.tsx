import { Box, Text } from 'grommet';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalContent } from '../app/AppModalStandard';
import { useToastContext } from '../app/ToastsContext';
import { HmmIcon } from '../app/icons/HmmIcon';
import { ReloadIcon } from '../app/icons/ReloadIcon';
import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { PostCard } from '../post/PostCard';
import { PostCardLoading } from '../post/PostCardLoading';
import { PostOverlay } from '../post/PostOverlay';
import { PostContext } from '../post/post.context/PostContext';
import { AppPostFull } from '../shared/types/types.posts';
import { AppButton, AppHeading } from '../ui-components';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading, LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useIsAtBottom } from '../ui-components/hooks/IsAtBottom';
import { PostFetcherInterface } from './posts.fetcher.hook';

const DEBUG = false;

export interface FilterOption {
  value: string;
  pretty: string;
}

/**
 * Receives a PostFetcherInterface object (with the posts array and methods
 * to interact with it) and renders it as a feed of PostCard.
 * It includes the infinite scrolling
 */
export const PostsFetcherComponent = (props: {
  feed: PostFetcherInterface;
  pageTitle: string;
  isPublicFeed?: boolean;
  showHeader?: boolean;
}) => {
  const { show } = useToastContext();
  const { constants } = useThemeContext();
  const { t } = useTranslation();

  const [postToShow, setPostToShow] = useState<AppPostFull | undefined>(
    undefined
  );

  const {
    pageTitle,
    feed,
    isPublicFeed: _isPublicFeed,
    showHeader: _showHeader,
  } = props;

  const isPublicFeed = _isPublicFeed !== undefined ? _isPublicFeed : false;
  const showHeader = _showHeader !== undefined ? _showHeader : true;

  const {
    posts,
    fetchOlder,
    errorFetchingOlder,
    isFetchingOlder,
    fetchNewer,
    isFetchingNewer,
    errorFetchingNewer,
    isLoading,
    moreToFetch,
  } = feed;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { isAtBottom } = useIsAtBottom(containerRef, bottomRef);

  useEffect(() => {
    if (isAtBottom && !isLoading && moreToFetch) {
      if (DEBUG)
        console.log(`${feed.feedNameDebug}fetchingOlder due to isAtBottom`, {
          isAtBottom,
          isLoading,
          moreToFetch,
        });

      fetchOlder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOlder, isAtBottom, isLoading, moreToFetch]);

  useEffect(() => {
    const error = errorFetchingOlder || errorFetchingNewer;
    if (error) {
      const message = (() => {
        const regexCode = /code:\s*(\d+)/;
        const regexRetry = /retryAfter:\s*(\d+)/;
        const code = error.message.match(regexCode);
        const retry = error.message.match(regexRetry);

        if (code && retry !== null) {
          const retrySeconds = parseInt(retry[1]);

          if (code && retry) {
            return `Too many requests to Twitter's API. Please retry in ${retrySeconds > 60 ? `${Math.ceil(retrySeconds / 60)} minutes` : `${retrySeconds} seconds`}`;
          }
        }

        return error.message;
      })();

      show({
        title: 'Error getting users posts',
        message,
      });
    }
  }, [errorFetchingOlder, errorFetchingNewer, show]);

  const showLoading = [1, 2, 4, 5, 6, 7, 8].map((ix) => (
    <PostCardLoading key={ix}></PostCardLoading>
  ));

  const showNoPosts = (
    <BoxCentered style={{ height: '100%' }}>
      <ModalContent
        type="small"
        title={t(AppGeneralKeys.noPostsFound)}
        icon={
          <BoxCentered
            style={{
              height: '60px',
              width: '60px',
              borderRadius: '40px',
              backgroundColor: '#CEE2F2',
            }}
            margin={{ bottom: '16px' }}>
            <HmmIcon size={40}></HmmIcon>
          </BoxCentered>
        }
        parragraphs={[
          <>{t(AppGeneralKeys.noPostsFoundDesc)}</>,
        ]}></ModalContent>
    </BoxCentered>
  );

  const showPosts = posts ? (
    <Box
      ref={containerRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        maxWidth: 600,
        margin: '0 auto',
      }}>
      {posts.map((post, ix) => (
        <Box key={ix} id={`post-${post.id}`} style={{ flexShrink: 0 }}>
          <PostContext postInit={post}>
            <PostCard
              isPublicFeed={isPublicFeed}
              handleClick={() => {
                setPostToShow(post);
              }}></PostCard>
          </PostContext>
        </Box>
      ))}

      <div style={{ padding: '1px' }} ref={bottomRef}></div>

      {isFetchingOlder && (
        <Box>
          <LoadingDiv height="120px" width="100%"></LoadingDiv>
        </Box>
      )}

      {moreToFetch && !isFetchingOlder && (
        <Box
          margin={{ vertical: 'medium', horizontal: 'medium' }}
          align="center"
          justify="center">
          <Text
            style={{
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '16px',
              color: 'grey',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onClick={() => fetchOlder()}>
            {t(AppGeneralKeys.loadMorePosts)}
          </Text>
        </Box>
      )}

      {!moreToFetch && (
        <Box
          style={{ flexShrink: 0 }}
          pad={{ vertical: 'large', horizontal: 'medium' }}
          align="center"
          justify="center">
          <Text
            style={{
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '16px',
              color: 'grey',
            }}>
            {t(AppGeneralKeys.noMorePosts)}
          </Text>
        </Box>
      )}
    </Box>
  ) : (
    <></>
  );

  const reload = isFetchingNewer ? (
    <Box>
      <Loading color={constants.colors.primary} size="20px"></Loading>
    </Box>
  ) : (
    <AppButton
      plain
      icon={<ReloadIcon size={20}></ReloadIcon>}
      onClick={() => fetchNewer()}></AppButton>
  );

  const header = (
    <Box
      pad={{ horizontal: 'medium', vertical: 'none' }}
      style={{
        backgroundColor: constants.colors.shade,
        flexShrink: 0,
        minHeight: '40px',
      }}>
      <Box direction="row" justify="between" align="center">
        <Box direction="row" align="center" gap="12px">
          <AppHeading level="3">{pageTitle}</AppHeading>
          <BoxCentered style={{ height: '40px' }}>{reload}</BoxCentered>
        </Box>
      </Box>
    </Box>
  );

  const showPost = postToShow && (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        backgroundColor: '#ffffff',
        height: '100%',
        width: '100%',
      }}>
      <PostOverlay
        postId={postToShow.id}
        postInit={postToShow}
        onPostNav={{
          onBack: () => setPostToShow(undefined),
          onPrev: () => {
            const { prevPostId } = feed.getNextAndPrev();
            if (prevPostId) {
              const prev = feed.getPost(prevPostId);
              setPostToShow(prev);
            }
          },
          onNext: () => {
            const { nextPostId } = feed.getNextAndPrev();
            if (nextPostId) {
              const next = feed.getPost(nextPostId);
              setPostToShow(next);
            }
          },
        }}></PostOverlay>
    </Box>
  );

  return (
    <>
      {showHeader && header}
      <Box
        fill
        style={{ backgroundColor: '#FFFFFF', position: 'relative' }}
        justify="start">
        {!posts || isLoading
          ? showLoading
          : posts.length === 0
            ? showNoPosts
            : showPosts}
        {showPost}
      </Box>
    </>
  );
};
