import { Request } from 'express';

import { DefinedIfTrue } from '../@shared/types';
import { Services } from '../instances/services';

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

export const getServices = (request: Request) => {
  const services = (request as any).services as Services;
  if (!services) {
    throw new Error(`Services not found`);
  }
  return services;
};
