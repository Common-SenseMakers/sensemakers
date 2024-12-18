import { BoxExtendedProps } from 'grommet';
import { useMemo } from 'react';

import { ALL_IDENTITY_PLATFORMS } from '../shared/types/types.platforms';
import { AccountProfileRead } from '../shared/types/types.profiles';
import { AppUserPublicRead } from '../shared/types/types.user';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { AccountProfileHeader } from './AccountProfileHeader';

export const UserProfileHeader = (props: {
  user?: AppUserPublicRead;
  boxProps?: BoxExtendedProps;
}) => {
  const { user } = props;

  const accounts = useMemo(() => {
    if (!user) {
      return undefined;
    }

    let _profiles: AccountProfileRead[] = [];
    ALL_IDENTITY_PLATFORMS.forEach((platform) => {
      const accounts = user.profiles[platform];
      if (accounts) {
        _profiles = _profiles.concat(accounts);
      }
    });
    return _profiles;
  }, [user]);

  if (!accounts) {
    return <LoadingDiv width="100%" height={'32px'}></LoadingDiv>;
  }

  return <AccountProfileHeader accounts={accounts}></AccountProfileHeader>;
};
