import {
  OrcidSignupContext,
  OrcidSignupData,
  OrcidUserDetails,
} from '../../@shared/types';
import {
  APP_URL,
  ORCID_API_URL,
  ORCID_CLIENT_ID,
  ORCID_SECRET,
} from '../../config/config';
import { logger } from '../../instances/logger';
import { IdentityService } from '../platforms.interface';

export class OrcidService
  implements
    IdentityService<OrcidSignupContext, OrcidSignupData, OrcidUserDetails>
{
  public async getSignupContext() {
    return {
      link: `${ORCID_API_URL}/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${APP_URL}`,
    };
  }

  protected async fetchUserFromCode(code: string): Promise<OrcidUserDetails> {
    const params = new URLSearchParams();

    params.append('client_id', ORCID_CLIENT_ID);
    params.append('client_secret', ORCID_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', APP_URL);

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
    const user = await this.fetchUserFromCode(data.code);
    return user;
  }
}
