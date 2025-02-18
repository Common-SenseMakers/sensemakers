import express from 'express';

import { getPublicFeedController } from './feed/feed.controller';
import { getRefMetaController } from './links/links.controller';
import {
  getKeywordsController,
  getPostController,
  getUserPostsController,
  parsePostController,
  updatePostController,
} from './posts/controllers/posts.controller';
import {
  getClustersController,
  getProfileController,
  getProfilesController,
} from './profiles/profiles.controller';
import {
  getLoggedUserController,
  setUserOnboardedController,
  setUserSettingsController,
} from './users/controllers/logged.user.controller';
import {
  getSignupContextController,
  handleSignupController,
} from './users/controllers/platforms.auth.controller';
import { getUserController } from './users/controllers/public.user.controller';

export const router = express.Router();
export const adminRouter = express.Router();

router.post('/auth/:platform/context', getSignupContextController);
router.post('/auth/:platform/signup', handleSignupController);
router.post('/auth/settings', setUserSettingsController);
router.post('/auth/setOnboarded', setUserOnboardedController);
router.post('/auth/me', getLoggedUserController);

router.post('/posts/getOfUser', getUserPostsController);
router.post('/posts/get', getPostController);
router.post('/posts/parse', parsePostController);
router.post('/posts/update', updatePostController);

router.post('/feed/get', getPublicFeedController);

router.post('/refs/get', getRefMetaController);
router.post('/users/get', getUserController);

router.post('/keywords/getMany', getKeywordsController);

router.post('/profiles/get', getProfileController);
router.post('/profiles/getMany', getProfilesController);
router.post('/profiles/getClusters', getClustersController);
