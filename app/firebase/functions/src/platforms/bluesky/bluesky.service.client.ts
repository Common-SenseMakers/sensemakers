import AtpAgent, { AtpAgentLoginOpts, AtpSessionData } from '@atproto/api';
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
  async login(agent: AtpAgent, credentials: AtpAgentLoginOpts) {
    await agent.login(credentials);

    if (!agent.session) {
      throw new Error('Failed to login to Bluesky with admin credentials');
    }
  }

  /**
   * gets a session and credentials (username and pwd) and try to resume the session
   * it also refresh it if in time,
   * if it fails it forces a new login
   *
   * returns a new session object if updated
   */
  async resumeSession(
    agent: AtpAgent,
    session?: AtpSessionData,
    credentials?: BlueskyCredentials['credentials']
  ): Promise<AtpSessionData | undefined> {
    if (!session) {
      if (!credentials) {
        throw new Error(
          `Cannot resume session without a sesion or credentials`
        );
      }

      await this.login(agent, credentials);
      return agent.session;
    } else {
      try {
        await agent.resumeSession(session);

        if (!agent.session) {
          throw new Error('Failed to login to Bluesky with admin credentials');
        }

        const decodedAccessJwt = jwt.decode(
          agent.session.accessJwt
        ) as AccessJwtPayload;

        let newSession: AtpSessionData | undefined = undefined;

        /** if the access token is under 1 hour from expiring, refresh it */
        if (decodedAccessJwt.exp * 1000 - this.time.now() < 1000 * 60 * 60) {
          await agent.sessionManager.refreshSession();
          newSession = agent.session;
        }

        return newSession;
      } catch (e) {
        logger.error(
          'Failed to resume Bluesky session with admin credentials, trying to login again'
        );

        if (!credentials) {
          throw new Error(
            `Cannot resume session without a sesion or credentials`
          );
        }

        await this.login(agent, credentials);
        return agent.session;
      }
    }
  }

  /** gets a valid AtpAgent client using the admin credentials or current session,
   * it also persist the session in the admin DB
   */
  async getAdminClient(): Promise<AtpAgent> {
    const agent = new AtpAgent({ service: this.config.BLUESKY_SERVICE_URL });
    const session = await this.getPersistedSession();

    const newSession = await this.resumeSession(agent, session, {
      identifier: this.config.BLUESKY_USERNAME,
      password: this.config.BLUESKY_APP_PASSWORD,
    });

    if (!agent.session) {
      throw new Error(
        'Failed to resume Bluesky session with admin credentials'
      );
    }

    if (newSession) {
      await this.persistSession(agent.session);
    }

    return agent;
  }

  /** gets a valid AtpAgent client using the provided credentials */
  getUserClient = async (credentials: BlueskyCredentials) => {
    /** if credentials are provided (user-specific session) */
    const atpAgent = new AtpAgent({ service: this.config.BLUESKY_SERVICE_URL });

    const newSession = await atpAgent.resumeSession(credentials.session);

    if (!atpAgent.session) {
      throw new Error('Failed to initiate bluesky session');
    }

    const newCredentials = newSession
      ? { session: atpAgent.session, credentials: credentials.credentials }
      : undefined;

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

    const credentials: AtpAgentLoginOpts = {
      identifier: signupData.username,
      password: signupData.appPassword,
    };

    await agent.login(credentials);

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
        read: { session: sessionData, credentials },
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
      bluesky.credentials['write'] = { session: sessionData, credentials };
    }

    if (DEBUG)
      logger.debug('handleSignupData result', { bluesky }, DEBUG_PREFIX);

    return { accountDetails: bluesky, profile };
  }
}
