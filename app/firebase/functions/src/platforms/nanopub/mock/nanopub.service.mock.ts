import { anything, instance, spy, when } from 'ts-mockito';

import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import { logger } from '../../../instances/logger';
import { NanopubService } from '../nanopub.service';

let count = 0;

export type NanopubMockConfig = 'real' | 'mock-publish';

export const getNanopubMock = (
  service: NanopubService,
  type: NanopubMockConfig
) => {
  if (type === 'real') {
    return service;
  }

  const Mocked = spy(service);

  when(Mocked.publish(anything(), anything())).thenCall(
    (postPublish: PlatformPostPublish<string>) => {
      logger.warn(`called nanopub publish`, postPublish);

      const post: PlatformPostPosted<string> = {
        post_id: `ABC${count++}`,
        user_id: postPublish.userDetails.user_id,
        timestampMs: Date.now(),
        post: postPublish.draft,
      };
      return post;
    }
  );

  return instance(Mocked) as NanopubService;
};
