import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import {
  TokenVerifier,
  getTwitterAccessToken,
  getTwitterAuthLink,
} from '../../twitter/twitter.utils';
import { validateUser } from '../utils';
import { verifierCodeScheme } from './auth.schemas';

export const getTwitterCodeController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = validateUser(request, response);
    if (!userId) return;

    let authLink = await getTwitterAuthLink(userId);
    response.status(200).send({ success: true, authLink });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};

export const postTwitterVerifierController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = (request as any).userId;
    if (!userId) {
      response.status(403).send({});
      return;
    }

    const payload = (await verifierCodeScheme.validate(
      request.body
    )) as TokenVerifier;

    let twitter_user = await getTwitterAccessToken(userId, payload);
    logger.debug('twitter user', { twitter_user });
    response.status(200).send({ success: true, twitter_user });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
