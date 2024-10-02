import express from 'express';

import { addUserDataController } from './posts/controllers/posts.controller';

export const adminRouter = express.Router();

adminRouter.post('/addUserData', addUserDataController);
