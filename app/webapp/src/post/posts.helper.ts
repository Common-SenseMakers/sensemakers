import {
  AppPost,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostReviewStatus,
} from '../shared/types/types.posts';

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
  live?: boolean;
  manuallyPublished?: boolean;
  autoPublished?: boolean;
  isEditing?: boolean;
  unpublished?: boolean;
}
export const getPostStatuses = (post?: AppPostFull): AppPostStatus => {
  const processed = post && post.parsedStatus === AppPostParsedStatus.PROCESSED;
  const errored = post && post.parsingStatus === AppPostParsingStatus.ERRORED;
  const isParsing =
    post && post.parsingStatus === AppPostParsingStatus.PROCESSING;

  const pending = post && post.reviewedStatus === AppPostReviewStatus.PENDING;
  const ignored = post && post.reviewedStatus === AppPostReviewStatus.IGNORED;

  const isEditing = post && post.reviewedStatus === AppPostReviewStatus.DRAFT;

  return {
    processed,
    errored,
    isParsing,
    pending,
    ignored,
    isEditing,
  };
};

export const hideSemanticsHelper = (post?: AppPostFull): boolean => {
  const hide = post && post.reviewedStatus === AppPostReviewStatus.IGNORED;
  return hide !== undefined && hide;
};
