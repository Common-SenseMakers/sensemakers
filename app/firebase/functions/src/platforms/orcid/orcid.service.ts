import { ENVIRONMENTS } from '../../config/ENVIRONMENTS';
import {
  APP_URL,
  NODE_ENV,
  ORCID_API_URL,
  ORCID_CLIENT_ID,
  ORCID_SECRET,
} from '../../config/config';
import { logger } from '../../instances/logger';
import { UsersService } from '../../users/users.service';
import { OAuthIdentityService } from '../identity.service';

export class OrcidService implements OAuthIdentityService {
  constructor(protected usersService: UsersService) {}

  public async getAuthLink() {
    return `${ORCID_API_URL}/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${APP_URL}`;
  }

  protected async fetchUserFromCode(
    code: string
  ): Promise<{ orcid: string; name: string }> {
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

  public async handleCode(code: string): Promise<string> {
    const user =
      NODE_ENV !== ENVIRONMENTS.TEST
        ? await this.fetchUserFromCode(code)
        : {
            orcid: code,
            name: 'Test User',
          };

    const userId = await this.usersService.create({
      orcid: {
        orcid: user.orcid,
        name: user.name,
      },
    });

    return userId;
  }
}
