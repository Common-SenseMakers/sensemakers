import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { getUser } from '../../db/user.repo';

export const getLoggedUserController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = (request as any).userId;
    if (!userId) {
      response.status(403).send({});
      return;
    }

    let user = await getUser(userId, true);
    response.status(200).send({
      success: true,
      user: {
        userId: user.userId,
        orcid: user.orcid,
        twitter: user.twitter
          ? {
              user_id: user.twitter.user_id,
              screen_name: user.twitter.screen_name,
            }
          : undefined,
        eth: user.eth,
      },
    });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
