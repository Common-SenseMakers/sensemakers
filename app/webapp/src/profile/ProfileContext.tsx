import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { UserProfileQuery } from '../shared/types/types.fetch';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { AppUserRead, PLATFORM } from '../shared/types/types.user';
import { getAccount } from '../user-login/user.helper';

const DEBUG = true;

interface ProfileContextType {
  profile?: TwitterUserProfile;
}

const ProfileContextValue = createContext<ProfileContextType | undefined>(
  undefined
);

export const ProfileContext: React.FC<{
  children: React.ReactNode;
  username: string;
  platformId: PLATFORM;
}> = ({ children, username, platformId }) => {
  const appFetch = useAppFetch();

  const { data: user } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => {
      try {
        return appFetch<AppUserRead, UserProfileQuery>('/api/users/profile', {
          username,
          platformId,
        });
      } catch (e: any) {
        console.error(e);
        throw new Error(e);
      }
    },
  });

  useEffect(() => {
    if (DEBUG) console.log('user', user);
  }, [user]);

  const account = getAccount(user, platformId, undefined, username);

  return (
    <ProfileContextValue.Provider
      value={{
        profile: account?.profile,
      }}>
      {children}
    </ProfileContextValue.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContextValue);
  if (!context) {
    throw new Error('must be used within a Context');
  }
  return context;
};
