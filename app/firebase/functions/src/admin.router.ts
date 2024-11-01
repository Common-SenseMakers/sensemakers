import express from 'express';

import { addAccountDataController } from './posts/controllers/posts.controller';

export const adminRouter = express.Router();

adminRouter.post('/addAccountData', addAccountDataController);
