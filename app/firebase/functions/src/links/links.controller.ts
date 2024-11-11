import { RequestHandler } from 'express';
import { object, string } from 'yup';

import { getServices } from '../controllers.utils';
import { logger } from '../instances/logger';

const DEBUG = false;

export const getRefSchema = object({
  ref: string().required(),
});

/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getRefMetaController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await getRefSchema.validate(request.body)) as {
      ref: string;
    };

    logger.debug(`${request.path} - query parameters`, { queryParams });
    const { links, db } = getServices(request);

    const refData = await db.run((manager) =>
      links.getOEmbed(queryParams.ref, manager)
    );

    if (DEBUG) logger.debug(`${request.path}: refData`, { refData });
    response.status(200).send({ success: true, data: refData });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
