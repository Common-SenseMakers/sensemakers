import { RequestHandler } from 'express';

import { createServices } from '../instances/services';

export const attachServices: RequestHandler = async (
  request,
  response,
  next
) => {
  (request as any).services = createServices();

  return next();
};
