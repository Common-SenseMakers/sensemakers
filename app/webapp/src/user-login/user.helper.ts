import { Restaurant } from 'grommet-icons';

import {
  AccountDetailsRead,
  AppUserRead,
  PLATFORM,
} from '../shared/types/types.user';

export const getAccount = (
  user?: AppUserRead,
  platformId?: PLATFORM,
  user_id?: string,
  username?: string
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

  const accounts = user[platformId] as AccountDetailsRead<any>[] | undefined;

  if (!accounts) {
    return undefined;
  }

  if (accounts.length === 0) {
    return undefined;
  }

  return user_id === undefined
    ? accounts[0]
    : accounts.find((a) =>
        user_id
          ? a.user_id === user_id
          : username
            ? a.profile.username === username
            : false
      );
};
