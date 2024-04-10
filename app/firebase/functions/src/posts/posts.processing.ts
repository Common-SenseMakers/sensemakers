import { ALL_PUBLISH_PLATFORMS } from '../@shared/types/types';
import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types/types.parser';
import {
  AppPostFull,
  PlatformPost,
  PostAndAuthor,
} from '../@shared/types/types.posts';
import { ParserService } from '../parser/parser.service';
import {
  FetchAllUserPostsParams,
  PlatformsService,
} from '../platforms/platforms.service';
import { getPrefixedUserId, getUniquePostId } from '../users/users.utils';

/**
 * Methods that will process batches of posts. It coordinates the calls
 * to the different PlatformServices but it does NOT read or write from the DB
 */
export class PostsProcessing {
  constructor(
    protected platforms: PlatformsService,
    protected parserService: ParserService
  ) {}

  /**
   * From a list of userIds and platform access credentials for each user,
   * this function fetch all recent posts from all platforms
   * */
  async fetch(params: FetchAllUserPostsParams): Promise<AppPostFull[]> {
    /** call the fetch */
    const platformPosts = await this.platforms.fetch(params);

    /** Convert into our internal format */
    const posts = await Promise.all(
      platformPosts.map(async (platformPostBase): Promise<AppPostFull> => {
        if (!platformPostBase.post_id) {
          throw new Error(`Fetched posts must contain a post_id`);
        }

        /**
         * Append data to PlatformPostBase to convert it into a PlatformPost
         * */
        const platformPost: PlatformPost = {
          ...platformPostBase,
          id: getUniquePostId(
            platformPostBase.platformId,
            platformPostBase.post_id
          ), // Fetched posts use platformId:post_id as the id
          status: 'fetched',
          postApproval: 'not-needed',
        };

        const { content } = await this.platforms.convertToGeneric(platformPost);

        /** the original post is stored as one mirror of the AppPost */
        const mirror: PlatformPost = {
          ...platformPost,
        };

        if (!platformPost.post_id) {
          throw new Error('Unexpected');
        }

        return {
          id: getUniquePostId(platformPost.platformId, platformPost.post_id),
          content,
          origin: platformPost.platformId,
          parseStatus: 'unprocessed',
          reviewedStatus: 'pending',
          authorId: getPrefixedUserId(
            platformPost.platformId,
            platformPost.user_id
          ),
          mirrors: [mirror],
        };
      })
    );

    return posts;
  }

  /** Parse a list of Posts and optionally stores them in the Posts collection */
  async parse(postsAndAuthors: PostAndAuthor[], store: boolean = false) {
    /** Prepare the ParsePostRequest */
    const postsToParse = postsAndAuthors.map(
      (postAndAuthor: PostAndAuthor): ParsePostRequest<TopicsParams> => {
        return {
          post: postAndAuthor.post,
          // TODO: this could be an env var but could also be read per user in the future
          params: {
            [PARSER_MODE.TOPICS]: { topics: ['science', 'technology'] },
          },
        };
      }
    );

    /** Call the parser */
    const parserResult = await this.parserService.parsePosts(postsToParse);

    /** Append semantics to each Post */
    if (parserResult) {
      const withSemantics = postsAndAuthors.map(
        (postAndAuthor): PostAndAuthor => {
          const parsedPostResult = parserResult.find((parsed) => parsed.post);
          const newPost = {
            ...postAndAuthor.post,
            originalParsed: parsedPostResult,
            semantics: parsedPostResult?.semantics,
          };
          return {
            post: newPost,
            author: postAndAuthor.author,
          };
        }
      );

      return withSemantics;
    } else {
      throw new Error('Error parsing');
    }
  }

  /**
   * Calls the convertFromGeneric on all platforms and returns the results as PlatformPosts
   * */
  public async preProcess(postsAndAuthors: PostAndAuthor[]) {
    const allPlatformPosts: PlatformPost[] = [];

    postsAndAuthors.forEach((postAndAuthor) => {
      ALL_PUBLISH_PLATFORMS.forEach((platformId) => {
        if (postAndAuthor.post.origin !== platformId) {
          const draft = this.platforms
            .get(platformId)
            .convertFromGeneric(postAndAuthor);

          const platformPost: PlatformPost = {
            id: getUniquePostId(platformId, postAndAuthor.post.id),
            platformId,
            user_id: '',
            status: 'draft',
            postApproval: 'pending',
            draft,
          };

          allPlatformPosts.push(platformPost);
        }
      });
    });

    return allPlatformPosts;
  }

  /**
   * Publish platformPosts
   * */
}
