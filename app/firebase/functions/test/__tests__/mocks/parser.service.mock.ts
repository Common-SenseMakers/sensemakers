import { anything, instance, spy, when } from 'ts-mockito';

import { ParsePostResult } from '../../../src/@shared/types/types.parser';
import { logger } from '../../../src/instances/logger';
import { ParserService } from '../../../src/parser/parser.service';
import { MOCKED_PARSER_RESULT } from '../test.services';

export const getParserMock = (parserService: ParserService) => {
  const Mocked = spy(parserService);

  const mockedResult: ParsePostResult = MOCKED_PARSER_RESULT;
  when(Mocked.parsePosts(anything())).thenCall((post) => {
    logger.warn(`called parser`, post);
    return mockedResult;
  });

  return instance(Mocked);
};
