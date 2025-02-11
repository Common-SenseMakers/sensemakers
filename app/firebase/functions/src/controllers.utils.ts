import { Request } from 'express';

import { DefinedIfTrue } from './@shared/types/types.user';
import { TransactionManager } from './db/transaction.manager';
import { Services } from './instances/services';
import { UsersService } from './users/users.service';

export const getAuthenticatedClerkUser = <T extends boolean>(
  request: Request,
  fail?: T
): DefinedIfTrue<T, string> => {
  const clerkUserId = (request as any).auth.userId;
  if (fail && !clerkUserId) {
    throw new Error(`userId not found on request`);
  }
  return clerkUserId;
};

export const getAuthenticatedUser = async <T extends boolean>(
  request: Request,
  usersService: UsersService,
  manager: TransactionManager,
  shouldThrow?: T
) => {
  const clerkId = getAuthenticatedClerkUser(request, shouldThrow);

  if (!clerkId) {
    throw new Error('clerkId not present on request');
  }

  const userId = await usersService.repo.getByClerkId(
    clerkId,
    manager,
    shouldThrow
  );
  return userId;
};

export const getServices = (request: Request) => {
  const services = (request as any).services as Services;
  if (!services) {
    throw new Error(`Services not found`);
  }
  return services;
};
