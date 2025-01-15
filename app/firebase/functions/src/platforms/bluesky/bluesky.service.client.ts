import AtpAgent, { AtpSessionData } from '@atproto/api';
import * as jwt from 'jsonwebtoken';

import {
  AccessJwtPayload,
  BlueskyAccountDetails,
  BlueskyCredentials,
  BlueskySignupData,
} from '../../@shared/types/types.bluesky';
import {
  PlatformAccountProfile,
  PlatformProfile,
} from '../../@shared/types/types.profiles';
import { DBInstance } from '../../db/instance';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { DEBUG } from '../platforms.tasks';
import { BlueskyServiceConfig } from './bluesky.service';
import { removeUndefinedFields } from './bluesky.utils';

const DEBUG_PREFIX = 'BlueskyServiceClient';

export class BlueskyServiceClient {
  protected DOC_ID = 'bluesky';

  constructor(
    protected db: DBInstance,
    protected time: TimeService,
    protected config: BlueskyServiceConfig
  ) {}

  /** reads the session object from the DB, return undefined if not there */
  async getPersistedSession(): Promise<AtpSessionData | undefined> {
    const platformDoc = await this.db.collections.adminCredentials
      .doc(this.DOC_ID)
      .get();

    if (!platformDoc.exists) {
      return undefined;
    }

    const data = platformDoc.data();
    if (!data || !data.session) {
      return undefined;
    }

    return data.session;
  }

  /** stores the session object in the DB */
  async persistSession(session: AtpSessionData) {
    await this.db.collections.adminCredentials.doc(this.DOC_ID).set({
      session: removeUndefinedFields(session),
    });
  }

  /** calls login with admin password */
  async adminLogin(agent: AtpAgent) {
    await agent.login({
      identifier: this.config.BLUESKY_USERNAME,
      password: this.config.BLUESKY_APP_PASSWORD,
    });

    if (!agent.session) {
      throw new Error('Failed to login to Bluesky with admin credentials');
    }

    await this.persistSession(agent.session);
  }

  /** gets a valid AtpAgent client using the admin credentials or current session */
  async getAdminClient(): Promise<AtpAgent> {
    const agent = new AtpAgent({ service: this.config.BLUESKY_SERVICE_URL });
    const session = await this.getPersistedSession();
    if (!session) {
      await this.adminLogin(agent);
    } else {
      try {
        await agent.resumeSession(session);
        /** TODO: Should we check also the exp date of the admin session? */
      } catch (e) {
        logger.error(
          'Failed to resume Bluesky session with admin credentials, trying to login again'
        );
        await this.adminLogin(agent);
      }
    }

    if (!agent.session) {
      throw new Error(
        'Failed to resume Bluesky session with admin credentials'
      );
    }

    return agent;
  }

  /** gets a valid AtpAgent client using the provided credentials */
  getUserClient = async (credentials: BlueskyCredentials) => {
    /** if credentials are provided (user-specific session) */
    const atpAgent = new AtpAgent({ service: this.config.BLUESKY_SERVICE_URL });

    await atpAgent.resumeSession(credentials);

    if (!atpAgent.session) {
      throw new Error('Failed to initiate bluesky session');
    }

    const decodedAccessJwt = jwt.decode(
      atpAgent.session.accessJwt
    ) as AccessJwtPayload;

    let newCredentials: BlueskyCredentials | undefined = undefined;

    /** if the access token is under 1 hour from expiring, refresh it */
    if (decodedAccessJwt.exp * 1000 - this.time.now() < 1000 * 60 * 60) {
      await atpAgent.sessionManager.refreshSession();
      newCredentials = atpAgent.session;
    }

    return { client: atpAgent, credentials: newCredentials };
  };

  /** gets a client using provided credentials (session) or returns and admin client */
  protected async getClient(
    credentials?: BlueskyCredentials
  ): Promise<{ client: AtpAgent; credentials?: BlueskyCredentials }> {
    /** if no credentials are provided use the admin credentials for app-wide API calls */
    if (!credentials) {
      return { client: await this.getAdminClient() };
    }

    return this.getUserClient(credentials);
  }

  /** login user, session data is stored in the user account */
  public async handleSignupData(signupData: BlueskySignupData) {
    if (DEBUG) logger.debug('handleSignupData', { signupData }, DEBUG_PREFIX);

    const agent = new AtpAgent({ service: this.config.BLUESKY_SERVICE_URL });

    await agent.login({
      identifier: signupData.username,
      password: signupData.appPassword,
    });

    if (!agent.session) {
      throw new Error('Failed to login to Bluesky');
    }
    const bskFullUser = await agent.getProfile({
      actor: agent.session.did,
    });

    const sessionData = removeUndefinedFields(agent.session);
    const bluesky: BlueskyAccountDetails = {
      user_id: bskFullUser.data.did,
      signupDate: this.time.now(),
      credentials: {
        read: sessionData,
      },
    };

    const bskSimpleUser: PlatformProfile = {
      id: bskFullUser.data.did,
      username: bskFullUser.data.handle,
      displayName: bskFullUser.data.displayName || bskFullUser.data.handle,
      avatar: bskFullUser.data.avatar || '',
      description: bskFullUser.data.description || '',
    };

    const profile: PlatformAccountProfile = {
      user_id: bskSimpleUser.id,
      profile: bskSimpleUser,
    };

    if (signupData.type === 'write') {
      bluesky.credentials['write'] = sessionData;
    }

    if (DEBUG)
      logger.debug('handleSignupData result', { bluesky }, DEBUG_PREFIX);

    return { accountDetails: bluesky, profile };
  }
}
