import { RequestHandler } from 'express';
import { object, string } from 'yup';

import { GetRefDisplayMeta } from '../@shared/types/types.references';
import { getServices } from '../controllers.utils';
import { logger } from '../instances/logger';

const DEBUG = false;

export const getRefSchema = object({
  ref: string().required(),
  clusterId: string().optional(),
});

export const getRefMetaController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await getRefSchema.validate(
      request.body
    )) as GetRefDisplayMeta;

    logger.debug(`${request.path} - query parameters`, { queryParams });
    const { links, db, clusters } = getServices(request);

    const refDisplayMeta = await db.run((manager) => {
      const cluster = clusters.getInstance(queryParams.clusterId);
      return links.getAggregatedRefLabelsForDisplay(
        queryParams.ref,
        manager,
        cluster
      );
    });

    if (DEBUG)
      logger.debug(`${request.path}: refDisplayMeta`, { refDisplayMeta });
    response.status(200).send({ success: true, data: refDisplayMeta });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
