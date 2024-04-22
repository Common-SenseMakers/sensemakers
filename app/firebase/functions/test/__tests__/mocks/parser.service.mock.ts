import * as fs from 'fs';
import { anything, instance, spy, when } from 'ts-mockito';

import { ParsePostResult } from '../../../src/@shared/types/types.parser';
import { logger } from '../../../src/instances/logger';
import { ParserService } from '../../../src/parser/parser.service';
import { MOCKED_PARSER_RESULT } from '../test.services';

export const getParserMock = (parserService: ParserService) => {
  const Mocked = spy(parserService);

  when(Mocked.parsePost(anything())).thenCall((post) => {
    const path = '../../firebase-py/functions/last_output.json';
    if (fs.existsSync(path)) {
      const jsonData = fs.readFileSync(path, 'utf8');
      logger.warn(`read parser data from file`, post);
      return JSON.parse(jsonData);
    }

    const mockedResult: ParsePostResult = MOCKED_PARSER_RESULT;
    return mockedResult;
  });

  return instance(Mocked);
};
