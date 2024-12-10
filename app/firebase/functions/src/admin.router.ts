import express from 'express';

import { addNonUserProfilesController } from './profiles/profiles.controller';

export const adminRouter = express.Router();

adminRouter.post('/addNonUserProfiles', addNonUserProfilesController);
