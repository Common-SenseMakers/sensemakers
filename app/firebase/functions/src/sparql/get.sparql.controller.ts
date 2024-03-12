import { RequestHandler } from 'express';

import { AppGetSparkQL } from '../@shared/types';
import { getSparqlValidationScheme } from './sparql.schemas';
import { fetchSparql } from './sparql.utils';

export const getSparqlController: RequestHandler = async (
  request,
  response
) => {
  try {
    const payload = (await getSparqlValidationScheme.validate(
      request.body
    )) as AppGetSparkQL;

    const data = await fetchSparql(payload.query);

    response.status(200).send({ success: true, data });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
