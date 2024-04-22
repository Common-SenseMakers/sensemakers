import axios from 'axios';

import { FUNCTIONS_BASE } from '../app/config';
import { AppPostFull } from '../shared/types/types.posts';

/** Get pending posts */
export const getUserPosts = async (
  userId: string,
  appAccessToken: string
): Promise<AppPostFull[]> => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/posts/fetch',
    { userId },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.posts;
};
