import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { AppUser } from '../../@shared/types';
import { TOKEN_EXPIRATION } from '../../config/config';
import { setUser } from '../../db/user.repo';
import { getAuthenticatedOrcidId } from '../orcid.auth.utils';
import { authCodeScheme } from './auth.schemas';
import { generateAccessToken } from './utils';

export const authCodeController: RequestHandler = async (request, response) => {
  try {
    const payload = (await authCodeScheme.validate(request.body)) as {
      code: string;
    };

    const authenticatedUser = await getAuthenticatedOrcidId(payload.code);

    logger.debug('authenticated user', { authenticatedUser });
    let token;

    if (authenticatedUser && authenticatedUser.orcid) {
      const user: AppUser = {
        userId: authenticatedUser.orcid,
        orcid: {
          orcid: authenticatedUser.orcid,
          name: authenticatedUser.name,
        },
      };

      /** store user on the database */
      logger.debug('storing new user', { user });
      await setUser(user);

      /** user correctly authenticated store its id in the access token */
      token = generateAccessToken(
        {
          userId: user.userId,
        },
        TOKEN_EXPIRATION
      );
      logger.debug('token generated slice', { token: token.slice(0, 8) });
      response.status(200).send({ success: true, token });
    } else {
      throw new Error(`Error authenticating user on ORCID`);
    }
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
