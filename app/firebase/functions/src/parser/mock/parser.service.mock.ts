import * as fs from 'fs';
import { anything, instance, spy, when } from 'ts-mockito';

import {
  ParsePostResult,
  SciFilterClassfication,
} from '../../@shared/types/types.parser';
import { logger } from '../../instances/logger';
import { ParserService } from '../parser.service';

export const MOCKED_SEMANTICS =
  '@prefix ns1: <http://purl.org/spar/cito/> .@prefix ns2: <https://sense-nets.xyz/> .@prefix schema: <https://schema.org/> .<http://purl.org/nanopub/temp/mynanopub#assertion> ns1:discusses <https://twitter.com/ItaiYanai/status/1780813867213336910> ;    schema:keywords "AI",        "LLM",        "NLP",        "academic-study",        "research-focus" ;    ns2:asksQuestionAbout <https://twitter.com/ItaiYanai/status/1780813867213336910> .';

export const MOCKED_PARSER_RESULT: ParsePostResult = {
  filter_classification: SciFilterClassfication.RESEARCH,
  semantics: MOCKED_SEMANTICS,
};

export type ParserMockConfig = 'real' | 'mock';

export const getParserMock = (
  parserService: ParserService,
  type: ParserMockConfig
) => {
  if (type === 'real') {
    return parserService;
  }

  const Mocked = spy(parserService);

  when(Mocked.parsePost(anything())).thenCall(async (post) => {
    const path = '../../firebase-py/functions/last_output.json';
    if (fs.existsSync(path)) {
      const jsonData = fs.readFileSync(path, 'utf8');
      logger.warn(`read parser data from file`, post);
      return JSON.parse(jsonData);
    }

    const mockedResult: ParsePostResult = MOCKED_PARSER_RESULT;

    await new Promise((resolve) =>
      setTimeout(resolve, 1 + Math.random() * 5000)
    );
    return mockedResult;
  });

  return instance(Mocked);
};
