import axios from 'axios';

import { FUNCTIONS_BASE } from '../app/config';
import { AppPostFull } from '../shared/types/types.posts';

/**
 * Triggers and awaits the fetch action for a given user.
 * */
export const fetchUserPosts = async (
  userId: string,
  appAccessToken: string
): Promise<boolean> => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/posts/fetch',
    { userId },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.success;
};

/**
 * Get user AppPosts. It reads from our DB and does
 * not triffer any refetch from any platform
 * */
export const getUserPosts = async (
  userId: string,
  appAccessToken: string
): Promise<AppPostFull[]> => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/posts/getOfUser',
    { userId },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.posts;
};

/**
 * Trigger the parsing of all users posts
 * */
export const triggerUserPosts = async (
  userId: string,
  appAccessToken: string
): Promise<AppPostFull[]> => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/posts/triggerParse',
    { userId },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.success;
};

/**
 * Get one AppPosts
 * */
export const getPost = async (
  postId: string,
  appAccessToken: string
): Promise<AppPostFull> => {
  const res = await axios.post(
    FUNCTIONS_BASE + '/posts/get',
    { postId },
    {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
      },
    }
  );

  return res.data.post;
};
