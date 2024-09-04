import { anything, instance, spy, when } from 'ts-mockito';
import { mastodon } from 'masto';

import { PlatformFetchParams } from '../../../@shared/types/types.fetch';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import {
  MastodonGetContextParams,
  MastodonSignupContext,
  MastodonSignupData,
  MastodonUserDetails,
} from '../../../@shared/types/types.mastodon';
import {
  TestUserCredentials,
  UserDetailsBase,
} from '../../../@shared/types/types.user';
import { ENVIRONMENTS } from '../../../config/ENVIRONMENTS';
import { APP_URL, NODE_ENV } from '../../../config/config.runtime';
import { TransactionManager } from '../../../db/transaction.manager';
import { logger } from '../../../instances/logger';
import { MastodonService } from '../mastodon.service';

const DEBUG = false;

interface MastodonTestState {
  latestStatusId: number;
  statuses: mastodon.v1.Status[];
}

let state: MastodonTestState = {
  latestStatusId: 0,
  statuses: [],
};

export interface MastodonMockConfig {
  publish?: boolean;
  signup?: boolean;
  fetch?: boolean;
  get?: boolean;
}

export const getMastodonMock = (
  mastodonService: MastodonService,
  type?: MastodonMockConfig,
  testUser?: TestUserCredentials
) => {
  if (!type || Object.keys(type).length === 0) {
    return mastodonService;
  }

  const mocked = spy(mastodonService);

  if (type.publish) {
    when(mocked.publish(anything(), anything())).thenCall(
      (postPublish: PlatformPostPublish<string>) => {
        // Implementation goes here
      }
    );
  }

  if (type.fetch) {
    when(mocked.fetch(anything(), anything(), anything())).thenCall(
      async (
        params: PlatformFetchParams,
        userDetails: UserDetailsBase,
        manager: TransactionManager
      ) => {
        // Implementation goes here
      }
    );
  }

  if (type.get) {
    when(mocked.get(anything(), anything(), anything())).thenCall(
      async (
        post_id: string,
        userDetails: UserDetailsBase,
        manager: TransactionManager
      ) => {
        // Implementation goes here
      }
    );
  }

  if (type.signup) {
    when(mocked.getSignupContext(anything(), anything())).thenCall(
      (
        user_id?: string,
        params?: MastodonGetContextParams
      ): MastodonSignupContext => {
        // Implementation goes here
      }
    );
    when(mocked.handleSignupData(anything())).thenCall(
      (data: MastodonSignupData): MastodonUserDetails => {
        // Implementation goes here
      }
    );
  }

  return instance(mocked);
};
