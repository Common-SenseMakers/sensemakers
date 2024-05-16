import { Outlet, useParams } from 'react-router-dom';

import { PLATFORM } from '../shared/types/types';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { ProfileContext } from './ProfileContext';

/** extract the platofrm and userame and setup the profile context */
export const ProfileRoot = () => {
  const { username, platform } = useParams();

  if (!username || !platform) {
    return <LoadingDiv></LoadingDiv>;
  }

  return (
    <ProfileContext platformId={platform as PLATFORM} username={username}>
      <Outlet />
    </ProfileContext>
  );
};
