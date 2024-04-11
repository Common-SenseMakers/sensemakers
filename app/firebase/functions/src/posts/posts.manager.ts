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
import { getUniquePostId } from '../users/users.utils';
import { PostsParser } from './posts.parser';
import { PostsRepository } from './posts.repository';

/**
 * Top level methods. They instantiate a TransactionManger and execute
 * read and writes to the DB
 */
export class PostsManager {
  constructor(
    protected users: UsersService,
    protected repo: PostsRepository,
    protected processing: PostsParser,
    protected platforms: PlatformsService
  ) {}

  /**
   * Reads all PlatformPosts from all users and returns a combination of PlatformPosts
   * and authors
   * */
  async fetchAll(): Promise<PostAndAuthor[]> {
    const users = await this.users.repo.getAll();
    const params = new Map();

    /**
     * prepare the credentials and lastFetched timestamps for
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

    /** fetch all new posts from all platforms */
    const platformPosts = await this.platforms.fetchAll(params);

    await this.storePlatformPosts(platformPosts);

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

  async checkAndStorePlatformPosts(platformPosts: PlatformPost[]) {
    /**
     * only if 'published' check if there is another 'published' PlatformPost
     * with the same post_id
     *
     * If not, store, and create an AppPost
     */
  }

  async createNewAppPost() {
    /**
     * Derive AppPost GenericPostData
     * */
    const { content } = await this.platforms.convertToGeneric(platformPost);

    /** Build the AppPostFull object */
    const post = {
      id: getUniquePostId(platformPost.platformId, platformPostFetched.post_id),
      content,
      origin: platformPost.platformId,
      parseStatus: 'unprocessed',
      reviewedStatus: 'pending',
      authorId: getPrefixedUserId(
        platformPostFetched.platformId,
        platformPostFetched.user_id
      ),
      mirrorsIds: [platformPost.id],
    };

    await this.repo.storePost(post, txManager);
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
          if (!mirror.draft) {
            throw new Error(
              `Unexpected trying to mark as approved a platoform post ${JSON.stringify(mirror)} without draftStatus`
            );
          }

          mirror = {
            ...mirror,
            draft: {
              user_id: mirror.draft.user_id,
              post: mirror.draft.post,
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
   * Reads all unpublished platform posts, publishes them, update the
   * platformPosts in the DB */
  async publishUnpublishedPosts() {
    /** get unpublished posts */
    const platformPosts: PlatformPost[] = []; // this.repo.getUnpublishedPlatformPosts();

    /** prepare author credentials for each platform and account */
    const perPlatform: PerPlatformPublish = new Map();
    await Promise.all(
      platformPosts.map(async (platformPost) => {
        const platformId = platformPost.platformId;
        const current = perPlatform.get(platformId) || [];

        if (!platformPost.draft) {
          throw new Error(
            `Unexpected. PlatformPost ${platformPost.id} does not have draftStatus`
          );
        }

        const author = await this.users.repo.getUserWithPlatformAccount(
          platformId,
          platformPost.draft.user_id,
          true
        );

        /** Get the crendetinals that platform:user_id */
        const account = UsersHelper.getAccount(
          author,
          platformId,
          platformPost.draft.user_id,
          true
        );

        const postToPublish: PlatformPostPublish = {
          draft: platformPost.draft?.post,
          id: platformPost.id,
        };

        current.push({ platformPost: postToPublish, userDetails: account });
        perPlatform.set(platformId as PLATFORM, current);
      })
    );

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

  async storePlatformPosts(platformPosts: PlatformPost[]) {
    await this.repo.storePostsMirrors(platformPosts);
  }

  /**
   * Calls the convertFromGeneric on all platforms and returns the results as PlatformPosts
   * */
  public async prepareDrafts(postsAndAuthors: PostAndAuthor[]) {
    const allPlatformPosts: PlatformPost[] = [];

    postsAndAuthors.forEach((postAndAuthor) => {
      ALL_PUBLISH_PLATFORMS.forEach((platformId) => {
        if (postAndAuthor.post.origin !== platformId) {
          const draft = this.platforms
            .get(platformId)
            .convertFromGeneric(postAndAuthor);

          const accounts = UsersHelper.getAccounts(
            postAndAuthor.author,
            platformId,
            true
          );

          accounts.forEach((account) => {
            const platformPost: PlatformPost = {
              id: getUniquePostId(platformId, postAndAuthor.post.id),
              platformId,
              status: 'draft',
              draft: {
                post: draft,
                postApproval: 'pending',
                user_id: account.user_id,
              },
            };

            allPlatformPosts.push(platformPost);
          });
        }
      });
    });

    return allPlatformPosts;
  }
}
