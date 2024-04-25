import axios from 'axios';

import { FUNCTIONS_BASE } from '../app/config';

export const postOrcidCode = async (code: string) => {
  const res = await axios.post(FUNCTIONS_BASE + '/auth/code', { code }, {});
  return res.data.token;
};

export const revokeTwitterCredentials = async (
  appAccessToken: string
): Promise<string> => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/auth/twitter-revoke',
    {},
    {
      headers: {
        authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.revokeLink;
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
