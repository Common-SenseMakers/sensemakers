import { AppPost } from '../shared/types/types.posts';

/** The prosemirror render assumes --- separates the posts and creates <p> for each */
export const concatenateThread = (post: {
  thread: AppPost['generic']['thread'];
}): string => {
  return post.thread.reduce(
    (_acc, post, ix) => _acc + `${ix > 0 ? '---' : ''}${post.content}`,
    ''
  );
};
