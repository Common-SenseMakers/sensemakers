import { useParams } from 'react-router-dom';

import { ProfileView } from './ProfileView';

/** extract the postId from the route and pass it to a PostContext */
export const ProfilePage = () => {
  const { username } = useParams();

  return <ProfileView username={username}></ProfileView>;
};
