import AtpAgent, { AtpSessionData } from '@atproto/api';

import { BlueskyCredentials } from '../@shared/types/types.bluesky';
import { PLATFORM } from '../@shared/types/types.platforms';
import { DBInstance } from '../db/instance';
import { BlueskyServiceConfig } from '../platforms/bluesky/bluesky.service';
import { removeUndefinedFields } from '../platforms/bluesky/bluesky.utils';

export class AdminRepository {
  constructor(protected db: DBInstance) {}

  async getBlueskyAdminCredentials(
    config: BlueskyServiceConfig
  ): Promise<BlueskyCredentials> {
    const platformId = PLATFORM.Bluesky;
    const blueskyDoc = await this.db.collections.adminCredentials
      .doc(platformId)
      .get();
    const { BLUESKY_APP_PASSWORD, BLUESKY_SERVICE_URL, BLUESKY_USERNAME } =
      config;
    const agent = new AtpAgent({ service: BLUESKY_SERVICE_URL });
    const blueskySession = await (async () => {
      if (!blueskyDoc.exists || !blueskyDoc.data()?.session) {
        await agent.login({
          identifier: BLUESKY_USERNAME,
          password: BLUESKY_APP_PASSWORD,
        });
        if (!agent.session) {
          throw new Error('Failed to login to Bluesky with admin credentials');
        }
        await this.db.collections.adminCredentials.doc(platformId).set({
          session: removeUndefinedFields(agent.session),
        });
        return agent.session;
      }
      return blueskyDoc.data()?.session as AtpSessionData;
    })();

    try {
      await agent.resumeSession(blueskySession);
    } catch (e) {
      await agent.login({
        identifier: BLUESKY_USERNAME,
        password: BLUESKY_APP_PASSWORD,
      });
    }

    if (!agent.session) {
      throw new Error(
        'Failed to resume Bluesky session with admin credentials'
      );
    }

    if (blueskySession.accessJwt !== agent.session.accessJwt) {
      await this.db.collections.adminCredentials.doc(platformId).set({
        session: removeUndefinedFields(agent.session),
      });
    }
    return agent.session;
  }
}
