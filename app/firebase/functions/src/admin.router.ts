import express from 'express';

import {
  addNonUserProfilesController,
  deleteProfilesController,
} from './profiles/profiles.controller';

export const adminRouter = express.Router();

adminRouter.post('/addProfiles', addNonUserProfilesController);
adminRouter.post('/deleteProfiles', deleteProfilesController);
