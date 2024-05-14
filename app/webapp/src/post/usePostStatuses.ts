import init, { Nanopub } from '@nanopub/sign';
import { useQuery } from '@tanstack/react-query';

import { PLATFORM } from '../shared/types/types';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostReviewStatus,
} from '../shared/types/types.posts';

export interface AppPostStatus {
  processed?: boolean;
  isParsing?: boolean;
  errored?: boolean;
  pending?: boolean;
  ignored?: boolean;
  nanopubPublished?: { uri: string };
  published?: boolean;
}

// One helper hook to derive all the statuses of a post
export const usePostStatuses = (post?: AppPostFull): AppPostStatus => {
  const { data: nanopubPublished } = useQuery({
    queryKey: ['nanopub', post],
    queryFn: async () => {
      try {
        const nanopub = post?.mirrors?.find(
          (m) => m.platformId === PLATFORM.Nanopub
        );
        if (!nanopub || !nanopub.posted) return null;

        await (init as any)();
        const nanopubObj = new Nanopub(nanopub.posted.post);
        return nanopubObj.info();
      } catch (e) {
        console.error(e);
      }
    },
  });

  const processed = post && post.parsedStatus === AppPostParsedStatus.PROCESSED;
  const errored = post && post.parsingStatus === AppPostParsingStatus.ERRORED;
  const isParsing =
    post && post.parsingStatus === AppPostParsingStatus.PROCESSING;

  const pending = post && post.reviewedStatus === AppPostReviewStatus.PENDING;
  const ignored = post && post.reviewedStatus === AppPostReviewStatus.IGNORED;
  const published =
    post && nanopubPublished !== undefined && nanopubPublished !== null;

  return {
    processed,
    errored,
    isParsing,
    pending,
    ignored,
    nanopubPublished,
    published,
  };
};
