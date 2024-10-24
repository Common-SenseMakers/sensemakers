import express from 'express';

import { addAccountsDataController } from './posts/controllers/posts.controller';

export const adminRouter = express.Router();

adminRouter.post('/addAccountsData', addAccountsDataController);
