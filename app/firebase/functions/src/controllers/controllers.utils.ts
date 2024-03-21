import { Request } from 'express';

import { DefinedIfTrue } from '../@shared/types';

export const getAuthenticatedUser = <T extends boolean>(
  request: Request,
  fail?: T
): DefinedIfTrue<T, string> => {
  const userId = (request as any).userId;
  if (fail && !userId) {
    throw new Error(`userId not found on request`);
  }
  return userId;
};
