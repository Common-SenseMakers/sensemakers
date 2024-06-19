import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostCreated,
  PlatformPostDraft,
  PlatformPostDraftApproval,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../@shared/types/types.platform.posts';
import {
  AppPost,
  AppPostCreate,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
} from '../@shared/types/types.posts';
import {
  ALL_PUBLISH_PLATFORMS,
  DefinedIfTrue,
} from '../@shared/types/types.user';
import { mapStoreElements, parseRDF } from '../@shared/utils/n3.utils';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { PlatformsService } from '../platforms/platforms.service';
import { TriplesRepository } from '../semantics/triples.repository';
import { TimeService } from '../time/time.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { getPrefixedUserId } from '../users/users.utils';
import { PlatformPostsRepository } from './platform.posts.repository';
import { PostsRepository } from './posts.repository';

const DEBUG = false;

/**
 * Per-PlatformPost or Per-AppPost methods.
 * They operate over a TransactionManager
 */
export class PostsProcessing {
  constructor(
    protected users: UsersService,
    private time: TimeService,
    public triples: TriplesRepository,
    public posts: PostsRepository,
    public platformPosts: PlatformPostsRepository,
    protected platforms: PlatformsService
  ) {}

  /**
   * Checks if a PlatformPost exist and creates it if not.
   * It also creates an AppPost for that PlatformPost
   * */
  async createPlatformPost(
    platformPost: PlatformPostCreate,
    manager: TransactionManager
  ): Promise<PlatformPostCreated | undefined> {
    const existing = platformPost.posted
      ? await this.platformPosts.getFrom_post_id(
          platformPost.posted.post_id,
          manager
        )
      : undefined;

    if (existing) {
      return undefined;
    }

    /** if a platformPost does not exist (most likely scenario) then create a new AppPost for this PlatformPost */
    const genericPostData = await this.platforms.convertToGeneric(platformPost);

    /** user_id might be defined or the intended one */
    const user_id = platformPost.posted
      ? platformPost.posted.user_id
      : platformPost.draft?.user_id;

    if (!user_id) {
      throw new Error(
        `Cannot create a post associated to a PlatformPost that does not have a draft or a posted`
      );
    }

    const platformPostCreated = this.platformPosts.create(
      platformPost,
      manager
    );

    /** create AppPost */
    const post = await this.createAppPost(
      {
        ...genericPostData,
        origin: platformPost.platformId,
        authorId: getPrefixedUserId(platformPost.platformId, user_id),
        mirrorsIds: [platformPostCreated.id],
        createdAtMs: platformPost.posted?.timestampMs || this.time.now(),
      },
      manager
    );

    /** set the postId of the platformPost */
    this.platformPosts.setPostId(platformPostCreated.id, post.id, manager);

    return { post, platformPost: platformPostCreated };
  }

  /** Store all platform posts */
  async createPlatformPosts(
    platformPosts: PlatformPostCreate[],
    manager: TransactionManager
  ) {
    const postsCreated = await Promise.all(
      platformPosts.map(async (platformPost) => {
        return await this.createPlatformPost(platformPost, manager);
      })
    );

    return postsCreated.filter((p) => p !== undefined) as PlatformPostCreated[];
  }

  /** Create and store all platform posts for one post */
  async createOrUpdatePostDrafts(postId: string, manager: TransactionManager) {
    const appPostFull = await this.getPostFull(postId, manager, true);

    const user = await this.users.repo.getUser(
      appPostFull.authorId,
      manager,
      true
    );

    /**
     * Create platformPosts as drafts on all platforms
     * */
    const drafts = await Promise.all(
      ALL_PUBLISH_PLATFORMS.map(async (platformId) => {
        const accounts = UsersHelper.getAccounts(user, platformId);

        if (DEBUG)
          logger.debug(
            `createPostDrafts - accounts ${JSON.stringify(accounts.map((a) => a.user_id))}`,
            {
              accounts,
            }
          );

        return Promise.all(
          accounts.map(async (account) => {
            /** create/update the draft for that platform and account */
            const draftPost = await this.platforms
              .get(platformId)
              .convertFromGeneric({ post: appPostFull, author: user });

            if (DEBUG)
              logger.debug(
                `createPostDrafts- account postId: ${postId}, platformId: ${platformId}, account: ${account.user_id}`,
                {
                  draftPost,
                  account,
                }
              );

            const existingMirror = appPostFull.mirrors.find(
              (m) =>
                m.platformId === platformId &&
                ((m.draft && m.draft.user_id === account.user_id) ||
                  (m.posted && m.posted.user_id))
            );

            if (DEBUG)
              logger.debug(
                `createPostDrafts- existing mirror ${postId}, existingMirror:${existingMirror !== undefined}`,
                {
                  existingMirror,
                }
              );

            const draft: PlatformPostDraft = {
              postApproval: PlatformPostDraftApproval.PENDING,
              user_id: account.user_id,
            };

            if (draftPost.unsignedPost) {
              draft.unsignedPost = draftPost.unsignedPost;
            }

            if (!existingMirror) {
              /** create and add as mirror */
              const draftCreate: PlatformPostCreate = {
                platformId,
                publishStatus: PlatformPostPublishStatus.DRAFT,
                publishOrigin: PlatformPostPublishOrigin.POSTED,
                draft,
              };

              const plaformPost = this.platformPosts.create(
                draftCreate,
                manager
              );
              if (DEBUG)
                logger.debug(
                  `createPostDrafts- addMirror ${postId} - plaformPost:${plaformPost.id}`,
                  {
                    postId,
                    plaformPost,
                  }
                );

              this.posts.addMirror(postId, plaformPost.id, manager);
            } else {
              if (DEBUG)
                logger.debug(`createPostDrafts- update ${postId}`, {
                  postId,
                  draft,
                });
              this.platformPosts.update(existingMirror.id, { draft }, manager);
            }
          })
        );
      })
    );

    /** add drafts as post mirrors */

    return drafts.flat();
  }

  async upsertTriples(
    postId: string,
    manager: TransactionManager,
    semantics?: string
  ) {
    /** always delete old triples */
    await this.triples.deleteOfPost(postId, manager);

    if (semantics) {
      const post = await this.posts.get(postId, manager, true);
      const store = await parseRDF(semantics);

      const createdAtMs = post.createdAtMs;
      const authorId = post.authorId;

      /** store the triples */
      mapStoreElements(store, (q) => {
        this.triples.create(
          {
            postId,
            createdAtMs,
            authorId,
            subject: q.subject.value,
            predicate: q.predicate.value,
            object: q.object.value,
          },
          manager
        );
      });
    }
  }

  async createAppPost(
    input: Omit<
      AppPostCreate,
      'parsingStatus' | 'parsedStatus' | 'reviewedStatus' | 'republishedStatus'
    >,
    manager: TransactionManager
  ): Promise<AppPost> {
    /** Build the AppPostFull object */
    const postCreate: AppPostCreate = {
      ...input,
      parsedStatus: AppPostParsedStatus.UNPROCESSED,
      parsingStatus: AppPostParsingStatus.IDLE,
      reviewedStatus: AppPostReviewStatus.PENDING,
      republishedStatus: AppPostRepublishedStatus.PENDING,
    };

    /** Create the post */
    const post = this.posts.create(postCreate, manager);
    return post;
  }

  /** get AppPostFull */
  async getPostFull<T extends boolean, R = AppPostFull>(
    postId: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const post = await this.posts.get(postId, manager, shouldThrow);

    if (!post && shouldThrow) {
      throw new Error(`Post ${postId} not found`);
    }

    if (!post) {
      return undefined as DefinedIfTrue<T, R>;
    }

    const mirrors = await Promise.all(
      post.mirrorsIds.map((mirrorId) =>
        this.platformPosts.get(mirrorId, manager)
      )
    );

    return {
      ...post,
      mirrors: mirrors.filter((m) => m !== undefined) as PlatformPost[],
    } as unknown as DefinedIfTrue<T, R>;
  }

  async getFrom_post_id<T extends boolean, R = AppPost>(
    post_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const platformPostId = await this.platformPosts.getFrom_post_id(
      post_id,
      manager,
      true
    );

    const platformPost = await this.platformPosts.get(
      platformPostId,
      manager,
      true
    );

    if (!platformPost.postId) {
      throw new Error('Unexpected');
    }

    return this.posts.get(platformPost.postId, manager, shouldThrow);
  }
}
