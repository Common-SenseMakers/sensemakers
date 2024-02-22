import axios from 'axios';

import { FUNCTIONS_BASE } from '../app/config';
import { AppUserRead, EthAccountDetails } from '../shared/types';

export const postOrcidCode = async (code: string) => {
  const res = await axios.post(FUNCTIONS_BASE + '/auth/code', { code }, {});
  return res.data.token;
};

export const getTwitterAuthLink = async (appAccessToken: string) => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/auth/twitter-code',
    {},
    {
      headers: {
        authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.authLink;
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

export const postUserEthDetails = async (
  details: EthAccountDetails,
  appAccessToken: string
): Promise<void> => {
  const res = await axios.post(FUNCTIONS_BASE + '/auth/eth', details, {
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
    },
  });

  return res.data.post;
};
