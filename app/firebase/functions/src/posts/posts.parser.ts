import {
  PARSER_MODE,
  ParsePostRequest,
  TopicsParams,
} from '../@shared/types/types.parser';
import { PostAndAuthor } from '../@shared/types/types.posts';
import { ParserService } from '../parser/parser.service';
import { PlatformsService } from '../platforms/platforms.service';

/**
 * Methods that will process posts. It coordinates the calls
 * to the different PlatformServices but it does NOT read or write from the DB
 */
export class PostsParser {
  constructor(
    protected platforms: PlatformsService,
    protected parserService: ParserService
  ) {}

  /**
   * Parse a list of Posts and return them with the semantics and originalParsed
   * properties updated
   * */
  async parse(postsAndAuthors: PostAndAuthor[]): Promise<PostAndAuthor[]> {
    /** Prepare the ParsePostRequest */
    const postsToParse = postsAndAuthors.map(
      (post): ParsePostRequest<TopicsParams> => {
        return {
          post: post.post,
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

          return { post: newPost, author: postAndAuthor.author };
        }
      );

      /** return modified AppPosts */
      return withSemantics;
    } else {
      throw new Error('Error parsing');
    }
  }
}
