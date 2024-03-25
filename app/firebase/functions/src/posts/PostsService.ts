import { PlatformPost } from '../@shared/types.posts';
import {
  FetchAllUserPostsParams,
  PlatformsService,
} from '../platforms/platforms.service';
import { UsersService } from '../users/users.service';

export class PostsService {
  constructor(
    protected users: UsersService,
    protected platforms: PlatformsService
  ) {}

  /** [[[[PLACEHOLDER]]]] */
  async fetchForNewPosts(): Promise<PlatformPost[]> {
    const params: FetchAllUserPostsParams = new Map();
    /**
     * Prepare the params
     * - get all registered users
     * - for each user and platform check if the user has read
     * credentials for that platform, and the last fetched post for that platform
     * - if it has, store the user_id and time in the params
     */

    /** group the fetch per platform, not per user */

    /** call the fetch */
    const posts = await this.platforms.fetchPostsSince(params);
    return posts;
  }
}
