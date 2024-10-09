import {
  AuthenticationResult,
  OrcidAccountDetails,
  OrcidCredentials,
  OrcidProfile,
  OrcidSignupContext,
  OrcidSignupData,
} from '../../@shared/types/types.orcid';
import { PLATFORM } from '../../@shared/types/types.platforms';
import { AccountProfileCreate } from '../../@shared/types/types.profiles';
import {
  ORCID_API_URL,
  ORCID_CLIENT_ID,
  ORCID_SECRET,
} from '../../config/config.runtime';
import { logger } from '../../instances/logger';
import { IdentityService } from '../platforms.interface';

const DEBUG = true;
const DEBUG_PREFIX = 'OrcidService';

export class OrcidService
  implements
    IdentityService<OrcidSignupContext, OrcidSignupData, OrcidAccountDetails>
{
  public async getSignupContext(): Promise<OrcidSignupContext> {
    throw new Error('not implemented');
  }

  protected async fetchCredentialsFromCode(
    code: string,
    redirect_uri: string
  ): Promise<AuthenticationResult> {
    const params = new URLSearchParams();

    params.append('client_id', ORCID_CLIENT_ID.value());
    params.append('client_secret', ORCID_SECRET.value());
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);

    if (DEBUG) {
      logger.debug(
        `Fetching credentials from code ${code}`,
        { params: params.toString() },
        DEBUG_PREFIX
      );
    }

    const response = await fetch(`${ORCID_API_URL}/oauth/token`, {
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/x-www-form-urlencoded'],
      ],
      method: 'post',
      body: params,
    });

    if (!response.ok) {
      const body = await response.json();
      logger.error(`Error getting Orcid token ${JSON.stringify(body)}`);
      throw new Error(`Error getting Orcid token: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.orcid) {
      throw new Error(`Error authenticating user on ORCID`);
    }
    return data;
  }

  public async handleSignupData(data: OrcidSignupData) {
    if (DEBUG) {
      logger.debug(
        `handleSignupData code: ${data.code}`,
        { data },
        DEBUG_PREFIX
      );
    }

    const result = await this.fetchCredentialsFromCode(
      data.code,
      data.callbackUrl
    );

    const credentials: OrcidCredentials = {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      scope: result.scope,
      token_type: result.token_type,
    };

    const orcidProfile: OrcidProfile = {
      name: result.name,
      orcid: result.orcid,
    };

    const orcid: OrcidAccountDetails = {
      user_id: result.orcid,
      signupDate: 0,
      credentials: { read: credentials },
    };

    if (DEBUG) {
      logger.debug(
        `handleSignupData done: ${data.code}`,
        { orcid },
        DEBUG_PREFIX
      );
    }

    const profile: AccountProfileCreate<OrcidProfile> = {
      platformId: PLATFORM.Orcid,
      user_id: orcid.user_id,
      profile: orcidProfile,
    };

    return { accountDetails: orcid, profile };
  }
}
