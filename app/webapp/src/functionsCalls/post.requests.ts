import axios from 'axios';

import { FUNCTIONS_BASE } from '../app/config';
import { ParserResult } from '../shared/parser.types';
import { AppPost, AppPostCreate } from '../shared/types';

export const postMessage = async (
  post: AppPostCreate,
  appAccessToken: string
): Promise<AppPost> => {
  const res = await axios.post(FUNCTIONS_BASE + '/posts/post', post, {
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
    },
  });

  return res.data.post;
};

export const getPostSemantics = async (
  content: string,
  appAccessToken: string
): Promise<ParserResult> => {
  console.log({ FUNCTIONS_BASE });
  const res = await axios.post(
    FUNCTIONS_BASE + '/posts/getSemantics',
    { content },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.result;
};
