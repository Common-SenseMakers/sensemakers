import { useEffect, useRef } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { subscribeToUpdates } from '../firestore/realtime.listener';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
} from '../shared/types/types.posts';
import { usePostsFetcher } from './posts.fetch.hook';
import { useQueryFilter } from './query.filter.hook';

const PAGE_SIZE = 5;

const DEBUG = false;

export const usePostsFetch = () => {
  const appFetch = useAppFetch();
  const { status } = useQueryFilter();

  const onPostsAdded = (newPosts: AppPostFull[]) => {
    /** trigger parse if not parsed and not parsing */
    newPosts.forEach((post) => {
      if (
        post.parsedStatus === AppPostParsedStatus.UNPROCESSED &&
        post.parsingStatus !== AppPostParsingStatus.PROCESSING
      ) {
        // async trigger parse
        appFetch(`/api/posts/parse`, { postId: post.id });
      }
    });
  };

  const fetching = usePostsFetcher(
    '/api/posts/getOfUser',
    status,
    true,
    onPostsAdded
  );
  return fetching;
};
