import express from 'express';

import {
  approvePostController,
  createDraftPostController,
  getPostController,
  getUserPostsController,
  parsePostController,
} from './posts/controllers/posts.controller';
import { getLoggedUserController } from './users/controllers/get.logged.controller';
import {
  getSignupContextController,
  handleSignupController,
} from './users/controllers/platforms.auth.controller';

export const router = express.Router();

router.post('/auth/:platform/context', getSignupContextController);
router.post('/auth/:platform/signup', handleSignupController);
router.post('/auth/me', getLoggedUserController);

router.post('/posts/getOfUser', getUserPostsController);
router.post('/posts/get', getPostController);
router.post('/posts/createDraft', createDraftPostController);
router.post('/posts/approve', approvePostController);
router.post('/posts/parse', parsePostController);
