import { StructuredSemantics } from '../@shared/types/types.parser';
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
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AppPost,
  AppPostCreate,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
} from '../@shared/types/types.posts';
import { DefinedIfTrue } from '../@shared/types/types.user';
import { mapStoreElements, parseRDF } from '../@shared/utils/n3.utils';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { PlatformsService } from '../platforms/platforms.service';
import { getProfileId } from '../profiles/profiles.repository';
import { TriplesRepository } from '../semantics/triples.repository';
import { TimeService } from '../time/time.service';
import { UsersHelper } from '../users/users.helper';
import { UsersService } from '../users/users.service';
import { PlatformPostsRepository } from './platform.posts.repository';
import { PostsHelper } from './posts.helper';
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
    manager: TransactionManager,
    authorUserId?: string
  ): Promise<PlatformPostCreated | undefined> {
    const existing = platformPost.posted
      ? await this.platformPosts.getFrom_post_id(
          platformPost.platformId,
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

    /** the profile may not exist in the Profiles collection */
    const authorProfileId = getProfileId(platformPost.platformId, user_id);

    /** create AppPost */
    const post = await this.createAppPost(
      {
        generic: genericPostData,
        origin: platformPost.platformId,
        authorProfileId,
        authorUserId,
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
    manager: TransactionManager,
    authorUserId?: string
  ) {
    const postsCreated = await Promise.all(
      platformPosts.map(async (platformPost) => {
        return await this.createPlatformPost(
          platformPost,
          manager,
          authorUserId
        );
      })
    );

    return postsCreated.filter((p) => p !== undefined) as PlatformPostCreated[];
  }

  /** Create and store all platform posts for one post */
  async createOrUpdatePostDrafts(postId: string, manager: TransactionManager) {
    if (DEBUG) logger.debug(`createOrUpdatePostDrafts ${postId}`);

    const appPostFull = await this.getPostFull(postId, manager, true);

    /**
     * Create platformPosts as drafts on all platforms (nanopub only for now)
     * */
    const drafts = await Promise.all(
      ([PLATFORM.Nanopub] as PUBLISHABLE_PLATFORM[]).map(async (platformId) => {
        const authorProfile = await this.users.profiles.getByProfileId(
          appPostFull.authorProfileId,
          manager,
          true
        );

        if (!authorProfile.userId) {
          throw new Error('Profile must be of a signed up userId');
        }

        const user = await this.users.repo.getUser(
          authorProfile.userId,
          manager,
          true
        );

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
            const platform = this.platforms.get(platformId);
            const userRead = await this.users.getUserWithProfiles(
              user.userId,
              manager
            );

            const draftPost = await platform.convertFromGeneric({
              post: appPostFull,
              author: userRead,
            });

            if (DEBUG)
              logger.debug(
                `createPostDrafts- account postId: ${postId}, platformId: ${platformId}, account: ${account.user_id}`,
                {
                  draftPost,
                  account,
                }
              );

            const existingMirror = PostsHelper.getPostMirror(appPostFull, {
              platformId,
              user_id: account.user_id,
            });

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
              const post_id = existingMirror.post_id;

              if (DEBUG)
                logger.debug(
                  `createPostDrafts- buildDeleteDraft for post ${postId}, existingMirror post_id:${post_id}`
                );

              let deleteDraft: undefined | any = undefined;

              if (post_id && platform.buildDeleteDraft) {
                const userRead = await this.users.getUserWithProfiles(
                  user.userId,
                  manager
                );

                deleteDraft = await platform.buildDeleteDraft(
                  post_id,
                  appPostFull,
                  userRead
                );
              }

              if (DEBUG)
                logger.debug(`createPostDrafts- update ${postId}`, {
                  postId,
                  draft,
                  deleteDraft,
                });

              await this.platformPosts.update(
                existingMirror.id,
                { draft, deleteDraft },
                manager
              );
            }
          })
        );
      })
    );

    /** add drafts as post mirrors */

    return drafts.flat();
  }

  async processSemantics(
    postId: string,
    manager: TransactionManager,
    semantics?: string
  ): Promise<StructuredSemantics | undefined> {
    /** always delete old triples */
    await this.triples.deleteOfPost(postId, manager);

    if (!semantics) return undefined;

    const post = await this.posts.get(postId, manager, true);
    const store = await parseRDF(semantics);

    const createdAtMs = post.createdAtMs;
    const authorProfileId = post.authorProfileId;

    const labels: Set<string> = new Set();
    const keywords: Set<string> = new Set();

    mapStoreElements(store, (q) => {
      /** store the triples */
      this.triples.create(
        {
          postId,
          postCreatedAtMs: createdAtMs,
          authorProfileId,
          subject: q.subject.value,
          predicate: q.predicate.value,
          object: q.object.value,
        },
        manager
      );

      if (q.predicate.value === 'https://schema.org/keywords') {
        keywords.add(q.object.value);
      } else {
        labels.add(q.predicate.value);
      }
    });

    return {
      labels: Array.from(labels),
      keywords: Array.from(keywords),
    };
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
    const post = this.posts.create(removeUndefined(postCreate), manager);
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
    platform: PLATFORM,
    post_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const platformPostId = await this.platformPosts.getFrom_post_id(
      platform,
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
