import express from 'express';

import {
  addNonUserProfilesController,
  deleteProfilesController,
} from './profiles/profiles.controller';
import { triggerAutofetchNonUsersController } from './tasksUtils/tasks.controller';

export const adminRouter = express.Router();

adminRouter.post('/addProfiles', addNonUserProfilesController);
adminRouter.post('/deleteProfiles', deleteProfilesController);
adminRouter.post(
  '/triggerAutofetchNonUsers',
  triggerAutofetchNonUsersController
);
