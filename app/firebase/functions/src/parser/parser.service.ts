import {
  ParsePostRequest,
  ParsePostResult,
} from '../@shared/types/types.parser';
import { normalizeUrl } from '../@shared/utils/links.utils';
import {
  addTripleToSemantics,
  mapStoreElements,
  parseRDF,
} from '../@shared/utils/n3.utils';
import {
  HAS_KEYWORD_URI,
  HAS_RDF_SYNTAX_TYPE_URI,
  HAS_TOPIC_URI,
  HAS_ZOTERO_REFERENCE_TYPE_URI,
  LINKS_TO_URI,
  THIS_POST_NAME_URI,
  THIS_POST_NAME_URI_PLACEHOLDER,
} from '../@shared/utils/semantics.helper';
import { logger } from '../instances/logger';

const DEBUG = false;
export class ParserService {
  constructor(protected url: string) {}

  async parsePost<P>(
    postReq: ParsePostRequest<P>
  ): Promise<ParsePostResult | undefined> {
    const response = await fetch(`${this.url}/SM_FUNCTION_post_parser`, {
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json'],
      ],
      method: 'post',
      body: JSON.stringify(postReq),
    });

    try {
      const body = await response.json();
      if (DEBUG) logger.debug('getPostSemantics', body);

      /** TEMPORARY PATCH: enforce linksTo predicate exists for each reference */
      let semantics = body.semantics;

      try {
        const rdfStore = await parseRDF(semantics);

        const referenceTriples: Record<string, [string, string, string][]> = {};

        mapStoreElements(rdfStore, (q) => {
          if (q.predicate.value === HAS_KEYWORD_URI) {
          } else {
            if (q.predicate.value === HAS_TOPIC_URI) {
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
                if (!referenceTriples[_normalizedReference]) {
                  referenceTriples[_normalizedReference] = [];
                }
                referenceTriples[_normalizedReference].push([
                  subject, // subject
                  label, // predicate
                  reference, // object
                ]);
              }
            }
          }
        });

        for (const [reference, triples] of Object.entries(referenceTriples)) {
          const hasLinksToPredicate = triples.find(([, predicate]) => {
            return predicate === LINKS_TO_URI;
          });
          if (!hasLinksToPredicate && triples[0] && triples[0].length === 3) {
            semantics = await addTripleToSemantics(semantics, [
              triples[0][0],
              LINKS_TO_URI,
              reference,
            ]);
          }
        }
      } catch (e) {
        logger.warn(
          `error adding LINKS_TO_URI to post with url ${postReq.post.url}. Using original parsed result which may not contain LINKS_TO_URI:`,
          JSON.stringify(e)
        );
      }
      body.semantics = semantics;
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
