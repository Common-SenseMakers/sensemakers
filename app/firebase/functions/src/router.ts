import express from 'express';

import {
  approvePostController,
  createDraftPostController,
  getPostController,
  getUserPostsController,
  getUserProfileController,
  getUserProfilePostsController,
  parsePostController,
  updatePostController,
} from './posts/controllers/posts.controller';
import {
  getLoggedUserController,
  setUserEmail,
  setUserSettingsController,
} from './users/controllers/logged.user.controller';
import {
  getSignupContextController,
  handleSignupController,
} from './users/controllers/platforms.auth.controller';

export const router = express.Router();

router.post('/auth/:platform/context', getSignupContextController);
router.post('/auth/:platform/signup', handleSignupController);
router.post('/auth/settings', setUserSettingsController);
router.post('/auth/me', getLoggedUserController);
router.post('/auth/setEmail', setUserEmail);

router.post('/users/profile', getUserProfileController);

router.post('/posts/getOfUser', getUserPostsController);
router.post('/posts/getProfilePosts', getUserProfilePostsController);

router.post('/posts/get', getPostController);
router.post('/posts/createDraft', createDraftPostController);
router.post('/posts/approve', approvePostController);
router.post('/posts/parse', parsePostController);
router.post('/posts/update', updatePostController);
