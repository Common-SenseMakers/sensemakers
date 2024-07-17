import { NANOPUB_EXPLORER_SERVER } from '../app/config';
import {
  AppPost,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostReviewStatus,
} from '../shared/types/types.posts';
import { PLATFORM } from '../shared/types/types.user';

/** The prosemirror render assumes --- separates the posts and creates <p> for each */
export const concatenateThread = (post: {
  thread: AppPost['generic']['thread'];
}): string => {
  return post.thread.reduce(
    (_acc, post, ix) => _acc + `${ix > 0 ? '---' : ''}${post.content}`,
    ''
  );
};

export interface AppPostStatus {
  processed?: boolean;
  isParsing?: boolean;
  errored?: boolean;
  pending?: boolean;
  ignored?: boolean;
  nanopubUrl?: string;
  published?: boolean;
  isEditing?: boolean;
}
export const getPostStatuses = (post?: AppPostFull): AppPostStatus => {
  const postedNanopub = post?.mirrors?.find(
    (m) => m.platformId === PLATFORM.Nanopub
  )?.posted;
  const nanopubUrl = postedNanopub
    ? `${NANOPUB_EXPLORER_SERVER}${postedNanopub.post_id}`
    : undefined;

  const processed = post && post.parsedStatus === AppPostParsedStatus.PROCESSED;
  const errored = post && post.parsingStatus === AppPostParsingStatus.ERRORED;
  const isParsing =
    post && post.parsingStatus === AppPostParsingStatus.PROCESSING;

  const pending = post && post.reviewedStatus === AppPostReviewStatus.PENDING;
  const ignored = post && post.reviewedStatus === AppPostReviewStatus.IGNORED;
  const published = !!postedNanopub;

  const isEditing = post && post.reviewedStatus === AppPostReviewStatus.DRAFT;

  return {
    processed,
    errored,
    isParsing,
    pending,
    ignored,
    nanopubUrl,
    published,
    isEditing,
  };
};
