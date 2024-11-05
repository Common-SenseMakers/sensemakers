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
  StructuredSemantics,
} from '../@shared/types/types.posts';
import { DefinedIfTrue } from '../@shared/types/types.user';
import { mapStoreElements, parseRDF } from '../@shared/utils/n3.utils';
import {
  HAS_KEYWORD_URI,
  HAS_TOPIC_URI,
} from '../@shared/utils/semantics.helper';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { LinksService } from '../links/links.service';
import { PlatformsService } from '../platforms/platforms.service';
import { getProfileId } from '../profiles/profiles.repository';
import { TriplesRepository } from '../semantics/triples.repository';
import { TimeService } from '../time/time.service';
import { UsersService } from '../users/users.service';
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
    public triples: TriplesRepository,
    public posts: PostsRepository,
    public platformPosts: PlatformPostsRepository,
    protected platforms: PlatformsService,
    protected linksService: LinksService
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

  async getRefMeta(
    url: string,
    manager: TransactionManager,
    originalParsed?: ParsePostResult
  ): Promise<RefMeta> {
    const refMetaOrg =
      originalParsed?.support?.refs_meta &&
      originalParsed?.support?.refs_meta[url];

    const isPartial =
      !refMetaOrg ||
      !refMetaOrg.title ||
      !refMetaOrg.summary ||
      !refMetaOrg.url;

    if (isPartial) {
      const oembed = await this.linksService.getOEmbed(url, manager);
      return {
        ...oembed,
        item_type: refMetaOrg?.item_type,
      };
    } else {
      /** store/update refMeta */
      this.linksService.setOEmbed(refMetaOrg, manager);
      return refMetaOrg;
    }
  }

  async processSemantics(
    postId: string,
    manager: TransactionManager,
    semantics?: string,
    originalParsed?: ParsePostResult
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
    const refsMeta: Record<string, RefMeta> = {};
    const topics: Set<string> = new Set();

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

      if (q.predicate.value === HAS_KEYWORD_URI) {
        keywords.add(q.object.value);
      } else {
        if (q.predicate.value === HAS_TOPIC_URI) {
          topics.add(q.object.value);
        } else {
          // non kewyords or is-a, ar marked as ref labels
          labels.add(q.predicate.value);
        }
      }
    });

    /** update labels refsMeta */

    await Promise.all(
      Array.from(labels).map(async (label) => {
        const url = label;
        const refMeta = await this.getRefMeta(url, manager, originalParsed);

        refsMeta[url] = refMeta;
      })
    );

    return {
      labels: Array.from(labels),
      keywords: Array.from(keywords),
      topics: Array.from(topics),
      refsMeta,
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
      editStatus: AppPostEditStatus.PENDING,
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
