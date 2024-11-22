import { Box, Text } from 'grommet';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalContent } from '../app/AppModalStandard';
import { useToastContext } from '../app/ToastsContext';
import { HmmIcon } from '../app/icons/HmmIcon';
import { AppGeneralKeys } from '../i18n/i18n.app.general';
import { PostCard } from '../post/PostCard';
import { PostCardLoading } from '../post/PostCardLoading';
import { PostContext } from '../post/post.context/PostContext';
import { BoxCentered } from '../ui-components/BoxCentered';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useIsAtBottom } from '../ui-components/hooks/IsAtBottom';
import { PostFetcherInterface } from './posts.fetcher.hook';

const DEBUG = false;

export interface FilterOption {
  value: string;
  pretty: string;
}

export interface OverlayConfig {
  post: boolean;
  ref: boolean;
  user: boolean;
}

/**
 * Receives a PostFetcherInterface object (with the posts array and methods
 * to interact with it) and renders it as a feed of PostCard.
 * It includes the infinite scrolling
 */
export const PostsFetcherComponent = (props: {
  feed: PostFetcherInterface;
  pageTitle?: string;
  isPublicFeed?: boolean;
  showHeader?: boolean;

  overlayConfig?: OverlayConfig;
}) => {
  const { show: showToast } = useToastContext();
  const { t } = useTranslation();

  const { feed, isPublicFeed: _isPublicFeed } = props;

  const isPublicFeed = _isPublicFeed !== undefined ? _isPublicFeed : false;

  const {
    posts,
    fetchOlder,
    errorFetchingOlder,
    isFetchingOlder,
    errorFetchingNewer,
    isLoading,
    moreToFetch,
  } = feed;

  const postsContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { isAtBottom } = useIsAtBottom(postsContainerRef, bottomRef);

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
  }, [isAtBottom]);

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

      showToast({
        title: 'Error getting users posts',
        message,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorFetchingOlder, errorFetchingNewer]);

  const showLoading = [1, 2, 4, 5, 6, 7, 8].map((ix) => (
    <PostCardLoading key={ix}></PostCardLoading>
  ));

  const showNoPosts = (
    <BoxCentered style={{ height: '100%' }} pad={{ top: 'large' }}>
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
        }></ModalContent>
    </BoxCentered>
  );

  const showPosts = posts ? (
    <Box
      ref={postsContainerRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        maxWidth: 600,
      }}>
      {posts.map((post, ix) => (
        <Box key={ix} id={`post-${post.id}`} style={{ flexShrink: 0 }}>
          <PostContext postInit={post}>
            <PostCard isPublicFeed={isPublicFeed}></PostCard>
          </PostContext>
        </Box>
      ))}

      {isFetchingOlder && (
        <Box style={{ flexShrink: 0 }}>
          <LoadingDiv height="120px" width="100%"></LoadingDiv>
        </Box>
      )}

      {moreToFetch && !isFetchingOlder && (
        <Box
          margin={{ vertical: 'medium', horizontal: 'medium' }}
          align="center"
          justify="center"
          style={{ flexShrink: 0 }}
          ref={bottomRef}>
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

  return (
    <Box
      fill
      style={{ backgroundColor: '#FFFFFF', position: 'relative' }}
      justify="start">
      {!posts || isLoading
        ? showLoading
        : posts.length === 0
          ? showNoPosts
          : showPosts}
    </Box>
  );
};
