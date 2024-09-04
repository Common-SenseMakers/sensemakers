import { RequestHandler } from 'express';

import { createServices } from '../instances/services';
import { getFirestore } from 'firebase-admin/firestore';

export const attachServices: RequestHandler = async (
  request,
  response,
  next
) => {
  const firestore = getFirestore();
  (request as any).services = createServices(firestore);

  return next();
};
