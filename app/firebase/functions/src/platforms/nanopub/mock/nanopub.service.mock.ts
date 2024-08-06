import { anything, instance, spy, when } from 'ts-mockito';

import { logger } from '../../../instances/logger';
import { NanopubService } from '../nanopub.service';

let count = 0;

export type NanopubMockConfig = 'real' | 'mock-publish';

/** make private methods public */
type MockedType = Omit<NanopubService, 'publishInternal'> & {
  publishInternal: NanopubService['publishInternal'];
};

export const getNanopubMock = (
  service: NanopubService,
  type: NanopubMockConfig
) => {
  if (type === 'real') {
    return service;
  }

  const Mocked = spy(service) as unknown as MockedType;

  when(Mocked.publishInternal(anything())).thenCall((signed: string) => {
    logger.warn(`called nanopub publishInternal`, signed);
    return {
      info: () => ({ uri: `https://w3id.org/np/ABC${count++}` }),
      rdf: () => signed,
    };
  });

  return instance(Mocked) as NanopubService;
};
