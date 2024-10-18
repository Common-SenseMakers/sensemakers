import { NANOPUB_EXPLORER_SERVER } from '../app/config';
import { NANOPUB_EXPLORER_URL_EMAIL } from '../email/constants';
import { PlatformPostPublishStatus } from '../shared/types/types.platform.posts';
import { PLATFORM } from '../shared/types/types.platforms';
import {
  AppPost,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
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
  const nanopubPlatformPost = post?.mirrors?.find(
    (m) => m.platformId === PLATFORM.Nanopub
  );

  const postedNanopub = nanopubPlatformPost?.posted;

  const nanopubHash = postedNanopub
    ? postedNanopub.post_id.split('/').pop()
    : undefined;

  const nanopubUrl = postedNanopub
    ? `${NANOPUB_EXPLORER_SERVER ? NANOPUB_EXPLORER_SERVER : NANOPUB_EXPLORER_URL_EMAIL}${nanopubHash}`
    : undefined;

  const unpublished =
    nanopubPlatformPost?.publishStatus ===
    PlatformPostPublishStatus.UNPUBLISHED;

  const processed = post && post.parsedStatus === AppPostParsedStatus.PROCESSED;
  const errored = post && post.parsingStatus === AppPostParsingStatus.ERRORED;
  const isParsing =
    post && post.parsingStatus === AppPostParsingStatus.PROCESSING;

  const pending = post && post.reviewedStatus === AppPostReviewStatus.PENDING;
  const ignored = post && post.reviewedStatus === AppPostReviewStatus.IGNORED;
  const published = !!postedNanopub;

  const manuallyPublished =
    post &&
    !!postedNanopub &&
    post.republishedStatus === AppPostRepublishedStatus.REPUBLISHED;

  const autoPublished =
    post &&
    !!postedNanopub &&
    post.republishedStatus === AppPostRepublishedStatus.AUTO_REPUBLISHED;

  const isEditing = post && post.reviewedStatus === AppPostReviewStatus.DRAFT;

  const live = published && !unpublished;

  return {
    processed,
    errored,
    isParsing,
    pending,
    ignored,
    nanopubUrl,
    live,
    manuallyPublished,
    autoPublished,
    isEditing,
    unpublished,
  };
};

export const hideSemanticsHelper = (post?: AppPostFull): boolean => {
  const hide = post && post.reviewedStatus === AppPostReviewStatus.IGNORED;
  return hide !== undefined && hide;
};
