import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { EthAccountDetails } from '../../@shared/types';
import { setUserEthDetails } from '../../db/user.repo';
import { ethDetailsScheme } from './auth.schemas';
import { validateEthDetails } from './utils';

export const potEthDetailsUserController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = (request as any).userId;
    if (!userId) {
      response.status(403).send({});
      return;
    }

    const payload = (await ethDetailsScheme.validate(
      request.body
    )) as EthAccountDetails;

    const valid = await validateEthDetails(payload);

    if (!valid) {
      throw new Error('Eth details not valid');
    }

    await setUserEthDetails(userId, payload);

    response.status(200).send({ success: true });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
