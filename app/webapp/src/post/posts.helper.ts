import { AppPost } from '../shared/types/types.posts';

export const concatenateThread = (post: {
  thread: AppPost['generic']['thread'];
}): string => {
  return post.thread.reduce((_acc, post) => `${post.content}\n\n`, '');
};
