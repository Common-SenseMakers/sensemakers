import { RequestHandler } from 'express';
import { getFirestore } from 'firebase-admin/firestore';

import { createServices } from '../instances/services';
import { getConfig } from '../services.config';

export const attachServices: RequestHandler = async (
  request,
  response,
  next
) => {
  const firestore = getFirestore();
  (request as any).services = createServices(firestore, getConfig());

  return next();
};
