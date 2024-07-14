import {
  AuthenticationResult,
  OrcidSignupContext,
  OrcidSignupData,
  OrcidUserCredentials,
  OrcidUserDetails,
  OrcidUserProfile,
} from '../../@shared/types/types.orcid';
import {
  ORCID_API_URL,
  ORCID_CLIENT_ID,
  ORCID_REDIRECT_URL,
  ORCID_SECRET,
} from '../../config/config.runtime';
import { logger } from '../../instances/logger';
import { IdentityService } from '../platforms.interface';

export class OrcidService
  implements
    IdentityService<OrcidSignupContext, OrcidSignupData, OrcidUserDetails>
{
  public async getSignupContext() {
    return {
      link: `${ORCID_API_URL}/oauth/authorize?client_id=${ORCID_CLIENT_ID.value()}&response_type=code&scope=/authenticate&redirect_uri=${ORCID_REDIRECT_URL.value()}`,
    };
  }

  protected async fetchCredentialsFromCode(
    code: string
  ): Promise<AuthenticationResult> {
    const params = new URLSearchParams();

    params.append('client_id', ORCID_CLIENT_ID.value());
    params.append('client_secret', ORCID_SECRET.value());
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', ORCID_REDIRECT_URL.value());

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
    const result = await this.fetchCredentialsFromCode(data.code);
    const credentials: OrcidUserCredentials = {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      scope: result.scope,
      token_type: result.token_type,
    };

    const profile: OrcidUserProfile = {
      name: result.name,
    };

    const orcid: OrcidUserDetails = {
      user_id: result.orcid,
      signupDate: 0,
      profile,
      read: credentials,
    };

    return orcid;
  }
}
