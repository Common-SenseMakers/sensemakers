import express from 'express';

import { getPublicFeedController } from './feed/feed.controller';
import {
  approvePostController,
  createDraftPostController,
  getPostController,
  getUserPostsController,
  parsePostController,
  unpublishPlatformPostController,
  updatePostController,
} from './posts/controllers/posts.controller';
import {
  getLoggedUserController,
  setUserEmailMagic,
  setUserSettingsController,
} from './users/controllers/logged.user.controller';
import {
  getSignupContextController,
  handleSignupController,
} from './users/controllers/platforms.auth.controller';

export const router = express.Router();
export const adminRouter = express.Router();

router.post('/auth/:platform/context', getSignupContextController);
router.post('/auth/:platform/signup', handleSignupController);
router.post('/auth/settings', setUserSettingsController);
router.post('/auth/me', getLoggedUserController);
router.post('/auth/setMagicEmail', setUserEmailMagic);

router.post('/posts/getOfUser', getUserPostsController);

router.post('/posts/get', getPostController);
router.post('/posts/createDraft', createDraftPostController);
router.post('/posts/approve', approvePostController);
router.post('/posts/parse', parsePostController);
router.post('/posts/update', updatePostController);
router.post('/posts/unpublish', unpublishPlatformPostController);

router.post('/feed/get', getPublicFeedController);
