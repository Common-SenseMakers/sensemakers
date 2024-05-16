import { Outlet, useParams } from 'react-router-dom';

import { PLATFORM } from '../shared/types/types';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { ProfileContext, useProfileContext } from './ProfileContext';
import { ProfileView } from './ProfileView';

/** extract the platofrm and userame and setup the profile context */
export const ProfilePage = () => {
  const { username } = useParams();
  const { profile } = useProfileContext();

  if (!profile) {
    return <LoadingDiv></LoadingDiv>;
  }

  return <ProfileView username={username} profile={profile}></ProfileView>;
};
