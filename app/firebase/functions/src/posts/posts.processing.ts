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
  StructuredSemantics,
} from '../@shared/types/types.posts';
import { RefDisplayMeta, RefPostData } from '../@shared/types/types.references';
import { DefinedIfTrue } from '../@shared/types/types.user';
import {
  handleQuotePostReference,
  normalizeUrl,
} from '../@shared/utils/links.utils';
import { mapStoreElements, parseRDF } from '../@shared/utils/n3.utils';
import { getProfileId } from '../@shared/utils/profiles.utils';
import {
  HAS_KEYWORD_URI,
  HAS_RDF_SYNTAX_TYPE_URI,
  HAS_TOPIC_URI,
  HAS_ZOTERO_REFERENCE_TYPE_URI,
  THIS_POST_NAME_URI,
  THIS_POST_NAME_URI_PLACEHOLDER,
} from '../@shared/utils/semantics.helper';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { LinksService } from '../links/links.service';
import { getOriginalRefMetaFromPost } from '../links/links.utils';
import { PlatformsService } from '../platforms/platforms.service';
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
    /** always delete old triples */
    await this.triples.deleteOfPost(postId, manager);

    if (!semantics) return undefined;

    const post = await this.posts.get(postId, manager, true);
    const store = await parseRDF(semantics);

    const createdAtMs = post.createdAtMs;
    const authorProfileId = post.authorProfileId;

    const labels: Set<string> = new Set();
    const keywords: Set<string> = new Set();
    const refsLabels: Record<string, string[]> = {};
    let topic: string | undefined = undefined;

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
          topic = q.object.value;
        } else {
          // non kewyords or is-a, are marked as ref labels
          const subject = q.subject.value;
          const reference = q.object.value;
          const label = q.predicate.value;
          if (
            (subject === THIS_POST_NAME_URI ||
              subject === THIS_POST_NAME_URI_PLACEHOLDER) &&
            label !== HAS_ZOTERO_REFERENCE_TYPE_URI &&
            label !== HAS_RDF_SYNTAX_TYPE_URI
          ) {
            /** normalize URL when they are feed  */
            const _normalizedReference = normalizeUrl(reference);
            /** temporary hotfit until the parser handles the quote post edge cases */
            const normalizedReference = handleQuotePostReference(
              _normalizedReference,
              post
            );
            labels.add(label);
            refsLabels[normalizedReference] = [
              ...(refsLabels[normalizedReference] || []),
              label,
            ];
          }
        }
      }
    });

    /**
     * for each ref, read and update its metadata from the links service,
     * also prepare the refsMeta object with the metadata of each url
     */
    const refsMeta: Record<string, RefMeta> = {};

    await Promise.all(
      Array.from(Object.keys(refsLabels)).map(async (url) => {
        const refMetaOrg = getOriginalRefMetaFromPost(post, url);

        const refMeta = await this.enhanceRefMeta(url, manager, refMetaOrg);
        refsMeta[url] = { ...refMeta, labels: refsLabels[url] || undefined };
      })
    );

    const structuredSemantics: StructuredSemantics = {
      labels: Array.from(labels),
      keywords: Array.from(keywords),
      topic,
      refsMeta: removeUndefined(refsMeta),
      refs: Object.keys(refsMeta),
    };

    /** Sync ref posts semantics on redundant subcollections */
    await Promise.all(
      Array.from(Object.keys(refsLabels)).map(async (ref) => {
        const refStructuredSemantics = {
          ...structuredSemantics,
          /** filter - only labels that apply to that ref */
          labels: refsLabels[ref],
        };

        await this.syncRefPost(ref, post, refStructuredSemantics, manager);
      })
    );

    await this.posts.update(postId, { structuredSemantics }, manager);
  }

  async syncRefPost(
    url: string,
    post: AppPost,
    semantics: StructuredSemantics,
    manager: TransactionManager
  ) {
    const refPostData: RefPostData = removeUndefined({
      id: post.id,
      authorProfileId: post.authorProfileId,
      createdAtMs: post.createdAtMs,
      structuredSemantics: semantics,
      platformPostUrl: post.generic.thread[0].url,
    } as RefPostData);

    /** always delete all labels from a post for a reference */
    await this.linksService.deleteRefPost(url, post.id, manager);
    await this.linksService.setRefPost(url, refPostData, manager);
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
    manager: TransactionManager
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
        const refMetaOrg = getOriginalRefMetaFromPost(post, ref);
        const oembed = await this.linksService.getOEmbed(
          ref,
          manager,
          refMetaOrg
        );
        if (config.addAggregatedLabels) {
          const refLabels = await this.posts.getAggregatedRefLabels([ref]);
          postFullMeta.set(ref, { oembed, aggregatedLabels: refLabels[ref] });
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
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const post = await this.posts.get(postId, manager, shouldThrow);

    if (!post && shouldThrow) {
      throw new Error(`Post ${postId} not found`);
    }

    if (!post) {
      return undefined as DefinedIfTrue<T, R>;
    }

    const postFull = await this.hydratePostFull(post, config, manager);

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
}
