import axios from 'axios';

import { FUNCTIONS_BASE } from '../app/config';
import { AppUserRead } from '../shared/types/types';

export const postOrcidCode = async (code: string) => {
  const res = await axios.post(FUNCTIONS_BASE + '/auth/code', { code }, {});
  return res.data.token;
};

export const postTwitterVerifierToken = async (
  appAccessToken: string,
  oauth: { oauth_token: string; oauth_verifier: string }
) => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/auth/twitter-verifier',
    oauth,
    {
      headers: {
        authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.twitter_user;
};

export const getLoggedUser = async (
  appAccessToken: string
): Promise<AppUserRead> => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/auth/me',
    {},
    {
      headers: {
        authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.user;
};
