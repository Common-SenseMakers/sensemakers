import {
  AppPost,
  AppPostEditStatus,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
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
export const getPostStatuses = (post?: AppPostFull | null): AppPostStatus => {
  const processed =
    !!post && post.parsedStatus === AppPostParsedStatus.PROCESSED;
  const errored = !!post && post.parsingStatus === AppPostParsingStatus.ERRORED;
  const isParsing =
    !!post && post.parsingStatus === AppPostParsingStatus.PROCESSING;

  const isEditing = !!post && post.editStatus === AppPostEditStatus.DRAFT;

  return {
    processed,
    errored,
    isParsing,
    isEditing,
  };
};
