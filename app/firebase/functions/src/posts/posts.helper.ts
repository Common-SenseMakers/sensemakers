import { DefinedIfTrue, PUBLISHABLE_PLATFORMS } from '../@shared/types/types';
import { AppPost, MirrorStatus } from '../@shared/types/types.posts';

export class PostsHelper {
  /**
   * From a post object return the first mirror of a platform
   * (undefined if not found, throw if _throw = true
   * */
  static getMirror<T extends boolean>(
    post: AppPost,
    platformId: PUBLISHABLE_PLATFORMS,
    _throw: T
  ): DefinedIfTrue<T, MirrorStatus> {
    const mirrors = post.mirrors[platformId];

    if (!mirrors && _throw) {
      throw new Error('Nanopub not created');
    }

    if (!mirrors) {
      return undefined as DefinedIfTrue<T, MirrorStatus>;
    }

    const mirror = mirrors[0];

    if (!mirror && _throw) {
      throw new Error('Nanopub not created');
    }

    if (!mirror) {
      return undefined as DefinedIfTrue<T, MirrorStatus>;
    }

    return mirror as DefinedIfTrue<T, MirrorStatus>;
  }
}
