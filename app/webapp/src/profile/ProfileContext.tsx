import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { PLATFORM, UserProfileQuery } from '../shared/types/types';
import { TwitterUserProfile } from '../shared/types/types.twitter';

const DEBUG = false;

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

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => {
      try {
        return appFetch<TwitterUserProfile, UserProfileQuery>(
          '/api/users/profile',
          {
            username,
            platformId,
          }
        );
      } catch (e: any) {
        console.error(e);
        throw new Error(e);
      }
    },
  });

  return (
    <ProfileContextValue.Provider
      value={{
        profile,
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
