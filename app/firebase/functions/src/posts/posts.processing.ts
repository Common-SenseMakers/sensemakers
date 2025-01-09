import { ClusterInstance } from '../@shared/types/types.clusters';
import { ParsePostResult, RefMeta } from '../@shared/types/types.parser';
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
import { DBInstance } from '../db/instance';
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
        editStatus: AppPostEditStatus.PENDING,
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
    semantics?: string,
    originalParsed?: ParsePostResult
  ): Promise<void> {
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

      const clustersIds = await this.posts.getPostClusters(postId, manager);

    await Promise.all(clustersIds.map(async (clusterId) => {
      const cluster = this.clusters.getInstance(clusterId);
      await this.syncPostInCluster(
        cluster,
        'add',
        post.id,
        manager,
        postData,
        structuredSemantics.refs || [],
        {
          new: structuredSemantics.keywords || [],
          removed: deletedKeywords,
        }
      );
    })

    await this.posts.update(postId, { structuredSemantics }, manager);
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
    /** Sync post in a cluster global posts collection */
    const posts = new BaseRepository(cluster.collection(CollectionNames.Posts));

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
          if (action === 'add' && postData) {
            await indexedRepo.setPost(keyword, postData, manager);
          } else {
            await indexedRepo.deletePost(keyword, postId, manager);
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

    /** Create the post */
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
          const refLabels = await this.linksService.getAggregatedRefLabels(
            ref,
            cluster,
            manager
          );
          postFullMeta.set(ref, { oembed, aggregatedLabels: refLabels });
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
    clusterId?: string,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const post = await this.posts.get(postId, manager, shouldThrow);

    if (!post && shouldThrow) {
      throw new Error(`Post ${postId} not found`);
    }

    if (!post) {
      return undefined as DefinedIfTrue<T, R>;
    }

    const cluster = this.clusters.getInstance(clusterId);
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

    await this.syncPostInCluster(this.db.firestore, 'remove', postId, manager);

    this.posts.delete(postId, manager);
  }
}
