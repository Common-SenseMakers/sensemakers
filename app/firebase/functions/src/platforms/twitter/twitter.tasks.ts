import { Request } from 'firebase-functions/v2/tasks';

import { FetchParams } from '../../@shared/types/types.fetch';
import { PLATFORM } from '../../@shared/types/types.platforms';
import { Services } from '../../instances/services';

export const FETCH_TWITTER_ACCOUNT_TASK = 'fetchTwitterAccount';

export const fetchTwitterAccountTask = async (
  req: Request,
  services: Services
) => {
  const profileId = req.data.profileId as string;
  const profile = await services.db.run(async (manager) => {
    return services.users.getOrCreateProfile(profileId, manager);
  });

  if (!profile) {
    throw new Error(`unable to find profile for ${profile}`);
  }
  /** the value of sinceId or untilId doesn't matter, as long as it exists, then it will be converted to appropriate fetch params */
  const fetchParams: FetchParams = req.data.latest
    ? { expectedAmount: req.data.amount, sinceId: profile.user_id }
    : { expectedAmount: req.data.amount, untilId: profile.user_id };

  await services.db.run(async (manager) => {
    return services.postsManager.fetchAccount(
      PLATFORM.Twitter,
      profile?.user_id,
      fetchParams,
      manager
    );
  });
};
