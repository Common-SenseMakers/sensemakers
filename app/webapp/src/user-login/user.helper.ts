import { Restaurant } from 'grommet-icons';

import { AppUserRead, PLATFORM } from '../shared/types/types';

export const getAccount = (
  user?: AppUserRead,
  platformId?: PLATFORM,
  user_id?: string
) => {
  if (!user) {
    return undefined;
  }

  if (!platformId) {
    return undefined;
  }

  if (platformId === PLATFORM.Local) {
    throw Error('undexpected');
  }

  const accounts = user[platformId];

  if (!accounts || accounts.length === 0) {
    return undefined;
  }

  return user_id === undefined
    ? accounts[0]
    : accounts.find((a) => a.user_id === user_id);
};
