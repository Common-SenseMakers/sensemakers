import {
  ActivityEventBase,
  ActivityType,
} from '../@shared/types/types.activity';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';

const DEBUG = false;
const PREFIX = 'ACTIVITY-CREATED-HOOK';

// receive the data of the created activity
export const activityEventCreatedHook = async (
  activityEvent: ActivityEventBase,
  services: Services
) => {
  const { db } = services;

  await db.run(
    async (manager) => {
      /**
       * create a notification object for parsed or autoposted activities
       * depending on the notifications and autpost configuration of the user
       */
      if (
        [ActivityType.PostAutoposted, ActivityType.PostParsed].includes(
          activityEvent.type
        )
      ) {
        if (DEBUG)
          logger.debug(
            `PostParsed or PostAutoposted activity created-${activityEvent.data.postId}`,
            undefined,
            PREFIX
          );

        // get the author of the post and create one notification for them
      }
    },
    undefined,
    undefined,
    `activityCreatedHook ${activityEvent.type} ${activityEvent.data.postId}`
  );
};
