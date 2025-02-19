import { ClusterInstance } from '../@shared/types/types.clusters';
import { RefMeta } from '../@shared/types/types.parser';
import {
  PlatformPost,
  PlatformPostCreate,
  PlatformPostCreated,
} from '../@shared/types/types.platform.posts';
import { PLATFORM } from '../@shared/types/types.platforms';
import {
  AppPost,
  AppPostCreate,
  AppPostEditStatus,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  HydrateConfig,
  IndexedPost,
  RankingScores,
  StructuredSemantics,
} from '../@shared/types/types.posts';
import { RefDisplayMeta } from '../@shared/types/types.references';
import { DefinedIfTrue } from '../@shared/types/types.user';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { getPostTabs } from '../@shared/utils/feed.config';
import { parseRDF } from '../@shared/utils/n3.utils';
import { getProfileId } from '../@shared/utils/profiles.utils';
import {
  getKeywords,
  getReferenceLabels,
  getTopic,
} from '../@shared/utils/semantics.helper';
import { ClustersService } from '../clusters/clusters.service';
import { BaseRepository, removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { LinksService } from '../links/links.service';
import { hashUrl } from '../links/links.utils';
import { PlatformsService } from '../platforms/platforms.service';
import { TimeService } from '../time/time.service';
import { UsersService } from '../users/users.service';
import { IndexedPostsRepo } from './indexed.posts.repository';
import { PlatformPostsRepository } from './platform.posts.repository';
import { PostsRepository } from './posts.repository';

/**
 * Per-PlatformPost or Per-AppPost methods.
 * They operate over a TransactionManager
 */
export class PostsProcessing {
  constructor(
    protected users: UsersService,
    private time: TimeService,
    public posts: PostsRepository,
    public platformPosts: PlatformPostsRepository,
    protected platforms: PlatformsService,
    public linksService: LinksService,
    public clusters: ClustersService
  ) {}

  /**
   * Checks if a PlatformPost exist and creates it if not.
   * If the root thread exists and the post is part of it, it merges the post into the thread.
   * It also creates an AppPost for that PlatformPost
   * */
  async createOrMergePlatformPost(
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

    /** if the root post exists, try merging them if part of the main thread */
    if (existing) {
      const rootPlatformPost = await this.platformPosts.get(
        existing,
        manager,
        true
      );
      return await this.mergePlatformPosts(
        rootPlatformPost,
        platformPost,
        manager
      );
    }

    /** if the root doesn't exist, create the thread */
    return await this.createPlatformPost(platformPost, manager, authorUserId);
  }
  async createPlatformPost(
    platformPost: PlatformPostCreate,
    manager: TransactionManager,
    authorUserId?: string
  ): Promise<PlatformPostCreated | undefined> {
    if (
      !this.platforms.get(platformPost.platformId).isRootThread(platformPost)
    ) {
      return undefined;
    }
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
        editStatus: AppPostEditStatus.PENDING,
      },
      manager
    );

    /** compute score and sync with clusters */
    const scores = this.computeScores(post);
    if (scores) {
      const indexedPost: IndexedPost = {
        id: post.id,
        authorProfileId: post.authorProfileId,
        origin: post.origin,
        createdAtMs: post.createdAtMs,
        scores,
      };
      await this.syncPostInClusters('add', post.id, manager, indexedPost);
    }

    /** set the postId of the platformPost */
    this.platformPosts.setPostId(platformPostCreated.id, post.id, manager);

    return { post, platformPost: platformPostCreated };
  }

  async mergePlatformPosts(
    rootThreadPlatformPost: PlatformPost,
    partialThreadPlatformPost: PlatformPostCreate,
    manager: TransactionManager
  ) {
    if (!rootThreadPlatformPost.postId) {
      throw new Error(`Unexpected: rootPost.postId is not defined`);
    }
    const platformService = this.platforms.get(
      rootThreadPlatformPost.platformId
    );
    const mergedPlatformPost = platformService.mergeBrokenThreads(
      rootThreadPlatformPost,
      partialThreadPlatformPost
    );
    if (!mergedPlatformPost) {
      return undefined;
    }
    const mergedAppPost = await platformService.convertToGeneric({
      posted: mergedPlatformPost,
    });

    await this.platformPosts.update(
      rootThreadPlatformPost.id,
      { posted: mergedPlatformPost },
      manager
    );

    await this.posts.update(
      rootThreadPlatformPost.postId,
      {
        generic: mergedAppPost,
        parsedStatus: AppPostParsedStatus.UNPROCESSED,
        parsingStatus: AppPostParsingStatus.IDLE,
      },
      manager
    );

    const platformPost = await this.platformPosts.get(
      rootThreadPlatformPost.id,
      manager,
      true
    );
    const appPost = await this.posts.get(
      rootThreadPlatformPost.postId,
      manager,
      true
    );
    return { platformPost, post: appPost };
  }

  /** Store all platform posts */
  async createOrMergePlatformPosts(
    platformPosts: PlatformPostCreate[],
    manager: TransactionManager,
    authorUserId?: string
  ) {
    const postsCreated = await Promise.all(
      platformPosts.map(async (platformPost) => {
        return await this.createOrMergePlatformPost(
          platformPost,
          manager,
          authorUserId
        );
      })
    );

    return postsCreated.filter((p) => p !== undefined) as PlatformPostCreated[];
  }

  async enhanceRefMeta(
    url: string,
    manager: TransactionManager,
    refMetaOrg?: RefMeta
  ): Promise<RefMeta> {
    const oembed = await this.linksService.getOEmbed(url, manager, refMetaOrg);
    return {
      ...oembed,
      item_type: refMetaOrg?.item_type,
    };
  }

  async processSemantics(
    postId: string,
    manager: TransactionManager,
    semantics?: string
  ): Promise<
    | {
        indexedPost: IndexedPost;
        updatedKeywords: { new: string[]; removed: string[] };
      }
    | undefined
  > {
    if (!semantics) return undefined;

    const post = await this.posts.get(postId, manager, true);
    const originalStructuredSemantics = post.structuredSemantics;
    const store = await parseRDF(semantics);

    const { labels, refsLabels } = getReferenceLabels(store);
    const keywords = getKeywords(store);
    const topic = getTopic(store);

    /**
     * for each ref, read and update its metadata from the links service,
     * also prepare the refsMeta object with the metadata of each url
     */
    const refsMeta: Record<string, RefMeta> = {};

    await Promise.all(
      Array.from(Object.keys(refsLabels)).map(async (url) => {
        const refMetaOrg = post.originalParsed?.support?.refs_meta?.[url];

        const refMeta = await this.enhanceRefMeta(url, manager, refMetaOrg);
        refsMeta[url] = { ...refMeta, labels: refsLabels[url] || undefined };
      })
    );

    const tabs = getPostTabs(labels);

    const structuredSemantics: StructuredSemantics = {
      labels: Array.from(labels),
      tabs: tabs,
      keywords: Array.from(keywords),
      topic,
      refsMeta: removeUndefined(refsMeta),
      refs: Object.keys(refsMeta),
    };

    /** Indexed post */
    const postData: IndexedPost = {
      id: post.id,
      authorProfileId: post.authorProfileId,
      createdAtMs: post.createdAtMs,
      structuredSemantics,
      origin: post.origin,
      authorUserId: post.authorUserId,
    };

    // Detect deleted keywords
    const deletedKeywords = originalStructuredSemantics?.keywords
      ? originalStructuredSemantics?.keywords.filter(
          (element) => !Array.from(keywords).includes(element)
        )
      : [];

    return {
      indexedPost: postData,
      updatedKeywords: {
        new: structuredSemantics.keywords || [],
        removed: deletedKeywords,
      },
    };
  }

  /** from postId make sure the post is updated on all clusters that include that post */
  async syncPostInClusters(
    action: 'add' | 'remove',
    postId: string,
    manager: TransactionManager,
    postData?: IndexedPost,
    refs?: string[],
    keywords?: { new: string[]; removed: string[] }
  ) {
    const post = await this.posts.get(postId, manager, true);

    /** post clusters are derived from the post authorProfileId */
    const clustersIds: (string | undefined)[] =
      await this.users.profiles.repo.getClusters(post.authorProfileId, manager);

    // undefined in the loop below will syunc to the global root cluster where all posts are stored
    clustersIds.push(undefined);

    await Promise.all(
      clustersIds.map(async (clusterId) => {
        const cluster = this.clusters.getInstance(clusterId);
        await this.syncPostInCluster(
          cluster,
          action,
          postId,
          manager,
          postData,
          refs || [],
          keywords
        );
      })
    );
  }

  computeScores(post: AppPost): RankingScores | undefined {
    const metrics = post.generic.engagementMetrics;
    if (!metrics) {
      return undefined;
    }

    const score1 =
      2 * metrics.likes +
      4 * (metrics.reposts + (metrics.quotes || 0)) +
      1 * metrics.replies;
    return {
      score1,
    };
  }

  async syncPostInCluster(
    cluster: ClusterInstance,
    action: 'add' | 'remove',
    postId: string,
    manager: TransactionManager,
    postData?: IndexedPost,
    refs?: string[],
    keywords?: { new: string[]; removed: string[] }
  ) {
    /** Sync post in a cluster-specifc "posts" collection */
    const posts = new BaseRepository(cluster.collection(CollectionNames.Posts));

    if (action === 'add') {
      posts.set(postId, postData, manager, { merge: true });
    } else {
      posts.delete(postId, manager);
    }

    /** Sync ref posts semantics on redundant subcollections */
    if (refs) {
      await Promise.all(
        refs.map(async (ref) => {
          const indexedRepo = new IndexedPostsRepo(
            cluster.collection(CollectionNames.Refs)
          );
          if (action === 'add' && postData) {
            await indexedRepo.setPost(hashUrl(ref), postData, manager);
          } else {
            await indexedRepo.deletePost(hashUrl(ref), postId, manager);
          }
        })
      );
    }

    if (keywords) {
      if (action === 'add') {
        await Promise.all(
          keywords.removed.map(async (keyword) => {
            const indexedRepo = new IndexedPostsRepo(
              cluster.collection(CollectionNames.Keywords)
            );
            const keywordEntry = await indexedRepo.get(keyword, manager);
            const nPosts = keywordEntry?.nPosts || 0;

            indexedRepo.set(
              keyword,
              { nPosts: nPosts > 0 ? nPosts - 1 : 0 },
              manager,
              { merge: true }
            );

            if (action === 'add' && postData) {
              /** delete the post of the removed keywords, still an add post action */
              await indexedRepo.deletePost(keyword, postData.id, manager);
            } else {
              await indexedRepo.deletePost(keyword, postId, manager);
            }
          })
        );
      }

      await Promise.all(
        keywords.new.map(async (keyword) => {
          const indexedRepo = new IndexedPostsRepo(
            cluster.collection(CollectionNames.Keywords)
          );
          const keywordEntry = await indexedRepo.get(keyword, manager);
          const nPosts = keywordEntry?.nPosts || 0;

          if (action === 'add' && postData) {
            await indexedRepo.setPost(keyword, postData, manager);
            indexedRepo.set(keyword, { nPosts: nPosts + 1 }, manager, {
              merge: true,
            });
          } else {
            await indexedRepo.deletePost(keyword, postId, manager);
            indexedRepo.set(
              keyword,
              { nPosts: nPosts > 0 ? nPosts - 1 : 0 },
              manager
            );
          }
        })
      );
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
      editStatus: AppPostEditStatus.PENDING,
    };

    /** Create the post in the root cluster */
    const post = this.posts.create(removeUndefined(postCreate), manager);
    return post;
  }

  /** fill post to Full */
  async hydratePostFull(
    post: AppPost,
    config: HydrateConfig,
    manager: TransactionManager,
    cluster: ClusterInstance
  ): Promise<AppPostFull> {
    const postFull: AppPostFull = post;

    if (config.addMirrors) {
      const mirrors = await Promise.all(
        post.mirrorsIds.map((mirrorId) =>
          this.platformPosts.get(mirrorId, manager)
        )
      );
      postFull.mirrors = mirrors.filter(
        (m) => m !== undefined
      ) as PlatformPost[];
    }

    const postFullMeta: Map<string, RefDisplayMeta> = new Map();
    await Promise.all(
      post.structuredSemantics?.refs?.map(async (ref) => {
        const refMetaOrg = post.originalParsed?.support?.refs_meta?.[ref];
        const oembed = await this.linksService.getOEmbed(
          ref,
          manager,
          refMetaOrg
        );
        if (config.addAggregatedLabels) {
          const refDisplayMeta =
            await this.linksService.getAggregatedRefLabelsForDisplay(
              ref,
              manager,
              cluster
            );
          postFullMeta.set(ref, refDisplayMeta);
        } else postFullMeta.set(ref, { oembed });
      }) || []
    );

    const references = Object.fromEntries(postFullMeta);
    postFull.meta = { references };

    return postFull;
  }

  /** get AppPostFull */
  async getPostFull<T extends boolean, R = AppPostFull>(
    postId: string,
    config: HydrateConfig,
    manager: TransactionManager,
    cluster: ClusterInstance,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const post = await this.posts.get(postId, manager, shouldThrow);

    if (!post && shouldThrow) {
      throw new Error(`Post ${postId} not found`);
    }

    if (!post) {
      return undefined as DefinedIfTrue<T, R>;
    }

    const postFull = await this.hydratePostFull(post, config, manager, cluster);

    return postFull as unknown as DefinedIfTrue<T, R>;
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
  /** delete a post and all its linked documents */
  async deletePostFull(postId: string, manager: TransactionManager) {
    const post = await this.posts.get(postId, manager, true);

    /** delete all platform posts */
    await Promise.all(
      post.mirrorsIds.map((mirrorId) =>
        this.platformPosts.delete(mirrorId, manager)
      )
    );

    await this.syncPostInClusters('remove', postId, manager);

    this.posts.delete(postId, manager);
  }
}
