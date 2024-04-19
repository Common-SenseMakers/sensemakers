import {
  ParsePostRequest,
  ParsePostResult,
} from '../@shared/types/types.parser';
import { logger } from '../instances/logger';

export class ParserService {
  constructor(protected url: string) {}

  async parsePosts<P>(
    posts: ParsePostRequest<P>
  ): Promise<ParsePostResult | undefined> {
    const response = await fetch(`${this.url}/SM_FUNCTION_post_parser`, {
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json'],
      ],
      method: 'post',
      body: JSON.stringify({ posts }),
    });

    try {
      const body = await response.json();
      logger.debug('getPostSemantics', body);
      return body as ParsePostResult;
    } catch (e) {
      logger.error(`error: ${JSON.stringify(e)}`);
      logger.error(
        `Error calling SM_FUNCTION_post_parser ${JSON.stringify(response)}`
      );
      return undefined;
    }
  }
}
