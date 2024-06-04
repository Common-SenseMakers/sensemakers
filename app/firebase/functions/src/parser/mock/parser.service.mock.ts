import * as fs from 'fs';
import { anything, instance, spy, when } from 'ts-mockito';

import {
  ParsePostRequest,
  ParsePostResult,
  SciFilterClassfication,
  TopicsParams,
} from '../../@shared/types/types.parser';
import { logger } from '../../instances/logger';
import { ParserService } from '../parser.service';
import { randomIndex } from './utils';

export const MOCKED_PARSER_RESULTS: ParsePostResult[] = [
  {
    filter_classification: SciFilterClassfication.RESEARCH,
    semantics:
      '@prefix ns1: <http://purl.org/spar/cito/> .@prefix ns2: <https://sense-nets.xyz/> .@prefix schema: <https://schema.org/> .<http://purl.org/nanopub/temp/mynanopub#assertion> ns1:discusses <https://twitter.com/ItaiYanai/status/1780813867213336910> ;    schema:keywords "AI",        "LLM",        "NLP",        "academic-study",        "research-focus" ;    ns2:asksQuestionAbout <https://twitter.com/ItaiYanai/status/1780813867213336910> .',
  },
  {
    filter_classification: SciFilterClassfication.NOT_RESEARCH,
    semantics:
      '@prefix ns1: <http://purl.org/spar/cito/> .@prefix schema: <https://schema.org/> .<http://purl.org/nanopub/temp/mynanopub#assertion> ns1:linksTo <https://twitter.com/DeSciMic/status/1765391765358436666> ;    schema:keywords "DecentralizedScience",        "ForumPost",        "Research",        "SocialMedia",        "Twitter" .',
  },
  {
    filter_classification: SciFilterClassfication.RESEARCH,
    semantics:
      '@prefix ns1: <https://sense-nets.xyz/> .@prefix schema: <https://schema.org/> .<http://purl.org/nanopub/temp/mynanopub#assertion> schema:keywords "AI",        "Benchmark",        "MachineLearning",        "NewRelease",        "ReinforcementLearning" ;    ns1:announcesResource <https://twitter.com/Rainmaker1973/status/1788916168008368195> .',
  },
  {
    filter_classification: SciFilterClassfication.RESEARCH,
    semantics:
      '@prefix ns1: <http://purl.org/spar/cito/> .<http://purl.org/nanopub/temp/mynanopub#assertion> ns1:discusses <https://gatherfor.medium.com/maslow-got-it-wrong-ae45d6217a8c> ;    ns1:includesQuotationFrom <https://twitter.com/andrea_is_a/status/1679471381929402369/photo/1> ;    ns1:reviews <https://gatherfor.medium.com/maslow-got-it-wrong-ae45d6217a8c> .',
  },
  {
    filter_classification: SciFilterClassfication.NOT_RESEARCH,
    semantics:
      '<http://sensentes/ThisText> <https://schema.org/keywords> "rerer" .',
  },
];

export type ParserMockConfig = 'real' | 'mock';

const DEBUG = true;

export const getParserMock = (
  parserService: ParserService,
  type: ParserMockConfig
) => {
  if (type === 'real') {
    return parserService;
  }

  const Mocked = spy(parserService);

  when(Mocked.parsePost(anything())).thenCall(
    async (post: ParsePostRequest<TopicsParams>) => {
      const path = '../../firebase-py/functions/last_output.json';
      if (fs.existsSync(path)) {
        const jsonData = fs.readFileSync(path, 'utf8');
        logger.warn(`read parser data from file`, post);
        return JSON.parse(jsonData);
      }
      const ix = randomIndex(
        0,
        MOCKED_PARSER_RESULTS.length - 1,
        post.post.content
      );

      const mockedResult: ParsePostResult = MOCKED_PARSER_RESULTS[ix];
      if (DEBUG)
        logger.debug(
          `mocked parser result ix:${ix} - content: ${post.post.content}`,
          mockedResult
        );

      await new Promise((resolve) =>
        setTimeout(resolve, 1 + Math.random() * 5000)
      );
      return mockedResult;
    }
  );

  return instance(Mocked);
};
