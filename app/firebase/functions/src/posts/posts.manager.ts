import { ALL_PUBLISH_PLATFORMS, PLATFORM } from '../@shared/types/types';
import {
  PerPlatformPublish,
  PlatformPost,
  PlatformPostPublish,
} from '../@shared/types/types.platform.posts';
import { AppPostMirror, PostAndAuthor } from '../@shared/types/types.posts';
import { FetchUserPostsParams } from '../platforms/platforms.interface';
import { PlatformsService } from '../platforms/platforms.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { PostsProcessing } from './posts.processing';
import { PostsRepository } from './posts.repository';

/**
 * Read data from the DB, call PostsProcessing methods
 * and writes data to the DB. Some methods can also
 * verify the user's permissions based on an input authenticatedUserId
 */
export class PostsManager {
  constructor(
    protected users: UsersService,
    protected repo: PostsRepository,
    protected processing: PostsProcessing,
    protected platforms: PlatformsService
  ) {}

  /**
   * Coordinate the fetch, parse and preProcess steps. It only stores
   * on the last step.
   */
  public async process() {
    const postsAndAuthors0 = await this.fetchFromUsers();
    const postsAndAuthors1 = await this.processing.parse(postsAndAuthors0);
    const platformPosts = await this.processing.preProcess(postsAndAuthors1);
  }

  async fetchFromUsers(store: boolean = false): Promise<PostAndAuthor[]> {
    const users = await this.users.repo.getAll();
    const params = new Map();

    /**
     * organize the credentials and lastFetched timestamps for
     * all users and platforms
     */
    users.forEach((user) => {
      ALL_PUBLISH_PLATFORMS.map((platformId) => {
        /** check if the user has credentials for that platform */
        const accounts = user[platformId];
        if (accounts) {
          accounts.forEach((account) => {
            const current = params.get(platformId) || [];
            const thisParams: FetchUserPostsParams = {
              start_time: account.read
                ? account.read.lastFetchedMs
                : account.signupDate,
              userDetails: account,
            };
            params.set(platformId, current.concat(thisParams));
          });
        }
      });
    });

    const posts = await this.processing.fetch(params);
    const postsAndAuthors: PostAndAuthor[] = [];

    posts.forEach((post) => {
      const author = users.find((user) => user.userId === post.authorId);

      if (!author) {
        throw new Error('Unexpected');
      }

      postsAndAuthors.push({
        post,
        author,
      });
    });

    return postsAndAuthors;
  }

  /**
   * Receive data about posts to mirror, validates it, and stores the platformPosts
   * It does not publishes them!
   * */
  public async approveMirrors(
    postsToMirror: AppPostMirror[],
    authenticatedUserId: string
  ) {
    const updatedPosts: PlatformPost[] = [];

    /**
     * Verify that publishing of mirror is triggered by the post author and mark as 'approved'
     * */
    await Promise.all(
      postsToMirror.map(async (postToMirror) => {
        /** verify authorship */
        const post = await this.repo.getPost(postToMirror.postId, true);

        if (post.authorId !== authenticatedUserId) {
          throw new Error(
            `Post ${post.id} not owned by ${authenticatedUserId}`
          );
        }

        /** get mirrors */
        postToMirror.mirrors.map((mirror) => {
          /**
           * mirrors must be existing PlatformPost, they MAY have been changed
           * by the author
           */
          mirror = {
            ...mirror,
            draftStatus: {
              draft: mirror.draftStatus?.draft,
              postApproval: 'approved',
            },
          };

          updatedPosts.push(mirror);
        });
      })
    );

    await this.updatePlatformPosts(updatedPosts);
  }

  /**
   * organize platformPosts by platform and append author credentials
   * */
  private async preparePlatformPosts(
    platformPosts: PlatformPost[]
  ): Promise<PerPlatformPublish> {
    const perPlatform: PerPlatformPublish = new Map();

    await Promise.all(
      platformPosts.map(async (platformPost) => {
        const platformId = platformPost.platformId;
        const current = perPlatform.get(platformId) || [];

        const author = await this.users.repo.getUserWithPlatformAccount(
          platformId,
          platformPost.user_id,
          true
        );

        /** Get the crendetinals that platform:user_id */
        const account = UsersHelper.getAccount(
          author,
          platformId,
          platformPost.user_id,
          true
        );

        const postToPublish: PlatformPostPublish = {
          draft: platformPost.draftStatus?.draft,
          id: platformPost.id,
        };

        current.push({ platformPost: postToPublish, userDetails: account });
        perPlatform.set(platformId as PLATFORM, current);
      })
    );

    return perPlatform;
  }

  /** reads all unpublished platform posts and publishes them */
  async publishUnpublishedPosts() {
    /** get unpublished posts */
    const platformPosts: PlatformPost[] = []; // this.repo.getUnpublishedPlatformPosts();
    const perPlatform = await this.preparePlatformPosts(platformPosts);
    const updatedPlatformPosts: PlatformPost[] = [];

    /**
     * Publish platformPosts and update the status
     * */
    await Promise.all(
      Array.from(perPlatform.entries()).map(
        async ([platformId, postsToPublish]) => {
          /** publish on platform as batch */
          const publishedPosts = await this.platforms
            .get(platformId)
            .publish(postsToPublish);

          /** update the platformPost status with the resutls */
          publishedPosts.forEach((publishedPost) => {
            /** find the corresponding platformPost */
            const platformPost = platformPosts.find(
              (post) => publishedPost.id === post.id
            );

            if (!platformPost) {
              throw new Error(
                `Unexpected. PlatformPost for published post ${JSON.stringify(publishedPost)} not found`
              );
            }

            const updatedPost: PlatformPost = {
              ...platformPost,
              status: 'posted',
            };

            updatedPlatformPosts.push(updatedPost);
          });
        }
      )
    );

    await this.updatePlatformPosts(updatedPlatformPosts);
  }

  async updatePlatformPosts(platformPosts: PlatformPost[]) {
    await this.repo.updatePostsMirrors(platformPosts);
  }
}
