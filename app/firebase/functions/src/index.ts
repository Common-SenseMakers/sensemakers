import express from 'express';
import * as functions from 'firebase-functions';
import {
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';

import { ActivityEventBase } from './@shared/types/types.activity';
import { NotificationFreq } from './@shared/types/types.notifications';
import { PlatformPost } from './@shared/types/types.platform.posts';
import { AppPost } from './@shared/types/types.posts';
import { CollectionNames } from './@shared/utils/collectionNames';
import { activityEventCreatedHook } from './activity/activity.created.hook';
import {
  AUTOFETCH_PERIOD,
  DAILY_NOTIFICATION_PERIOD,
  IS_EMULATOR,
  MONTHLY_NOTIFICATION_PERIOD,
  WEEKLY_NOTIFICATION_PERIOD,
} from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import { getServices } from './controllers.utils';
import { buildApp } from './instances/app';
import { createServices } from './instances/services';
import {
  NOTIFY_USER_TASK,
  notifyUserTask,
  triggerSendNotifications,
} from './notifications/notification.task';
import { platformPostUpdatedHook } from './posts/hooks/platformPost.updated.hook';
import { postUpdatedHook } from './posts/hooks/post.updated.hook';
import {
  AUTOFETCH_POSTS_TASK,
  autofetchUserPosts,
  triggerAutofetchPosts,
} from './posts/tasks/posts.autofetch.task';
import {
  AUTOPOST_POST_TASK,
  autopostPostTask,
} from './posts/tasks/posts.autopost.task';
import { PARSE_POST_TASK, parsePostTask } from './posts/tasks/posts.parse.task';
import { router } from './router';

// all secrets are available to all functions
const secrets = [
  envRuntime.ORCID_SECRET,
  envRuntime.OUR_TOKEN_SECRET,
  envRuntime.TWITTER_CLIENT_SECRET,
  envRuntime.NP_PUBLISH_RSA_PRIVATE_KEY,
  envRuntime.EMAIL_CLIENT_SECRET,
];

// import { fetchNewPosts } from './posts/posts.job';

/** Registed the API as an HTTP triggered function */
exports['api'] = functions
  .region(envDeploy.REGION)
  .runWith({
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets,
  })
  .https.onRequest(buildApp(router));

/** jobs */
exports.accountFetch = onSchedule(
  {
    schedule: AUTOFETCH_PERIOD,
    secrets,
  },
  triggerAutofetchPosts
);

exports.sendDailyNotifications = onSchedule(
  {
    schedule: DAILY_NOTIFICATION_PERIOD,
    secrets,
  },
  () => triggerSendNotifications(NotificationFreq.Daily, createServices())
);

exports.sendWeeklyNotifications = onSchedule(
  {
    schedule: WEEKLY_NOTIFICATION_PERIOD,
    secrets,
  },
  () => triggerSendNotifications(NotificationFreq.Weekly, createServices())
);

exports.sendMonthlyNotifications = onSchedule(
  {
    schedule: MONTHLY_NOTIFICATION_PERIOD,
    secrets,
  },
  () => triggerSendNotifications(NotificationFreq.Monthly, createServices())
);

// add enpoint when on emulator to trigger the scheduled task
if (IS_EMULATOR) {
  const scheduledTriggerRouter = express.Router();

  scheduledTriggerRouter.post('/autofetch', async (request, response) => {
    await triggerAutofetchPosts();
    response.status(200).send({ success: true });
  });

  scheduledTriggerRouter.post(
    '/sendDailyNotifications',
    async (request, response) => {
      await triggerSendNotifications(
        NotificationFreq.Daily,
        getServices(request)
      );
      response.status(200).send({ success: true });
    }
  );

  exports['trigger'] = functions
    .region(envDeploy.REGION)
    .runWith({
      timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
      memory: envDeploy.CONFIG_MEMORY,
      minInstances: envDeploy.CONFIG_MININSTANCE,
      secrets,
    })
    .https.onRequest(buildApp(scheduledTriggerRouter));
}

/** tasks */
exports[PARSE_POST_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets,
  },
  parsePostTask
);

exports[AUTOFETCH_POSTS_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets,
  },
  async (req) => {
    void (await autofetchUserPosts(req));
  }
);

exports[AUTOPOST_POST_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets,
  },
  autopostPostTask
);

exports[NOTIFY_USER_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets,
  },
  async (req) => {
    if (!req.data.userId) {
      throw new Error('userId not found for task notifyUserTask');
    }

    notifyUserTask(req.data.userId, createServices());
  }
);

/** hooks */
exports.postUpdateListener = onDocumentUpdated(
  {
    document: `${CollectionNames.Posts}/{postId}`,
    secrets,
  },
  async (event) => {
    const postId = event.params?.postId;
    const postBefore = event.data?.before as AppPost | undefined;
    const postAfter = event.data?.after as AppPost | undefined;

    if (!postId || !postBefore || !postAfter) {
      throw new Error('Unexpected post data not found in onDocumentUpdated');
    }

    await postUpdatedHook(
      { ...postAfter, id: postId },
      { ...postBefore, id: postId }
    );
  }
);

exports.postCreateListener = onDocumentCreated(
  {
    document: `${CollectionNames.Posts}/{postId}`,
    secrets,
  },
  async (event) => {
    const postId = event.params?.postId;
    const post = event.data?.data() as AppPost | undefined;

    if (!postId || !post) {
      throw new Error('Unexpected post data not found in onDocumentCreated');
    }

    await postUpdatedHook({ ...post, id: postId });
  }
);

exports.platformPostUpdateListener = onDocumentUpdated(
  {
    document: `${CollectionNames.PlatformPosts}/{platformPostId}`,
    secrets,
  },
  async (event) => {
    const postId = event.params?.platformPostId;
    const postBefore = event.data?.before as PlatformPost | undefined;
    const postAfter = event.data?.after as PlatformPost | undefined;

    if (!postId || !postBefore || !postAfter) {
      throw new Error('Unexpected post data not found in onDocumentUpdated');
    }

    await platformPostUpdatedHook(
      { ...postAfter, id: postId },
      { ...postBefore, id: postId }
    );
  }
);

exports.activityEventCreateListener = onDocumentCreated(
  {
    document: `${CollectionNames.Activity}/{activityEventId}`,
    secrets,
  },
  async (event) => {
    const activityEventId = event.params?.activityEventId;
    const activityEvent = event.data?.data() as ActivityEventBase | undefined;

    if (!activityEventId || !activityEvent) {
      throw new Error(
        'Unexpected activity data not found in onDocumentCreated'
      );
    }

    await activityEventCreatedHook({ ...activityEvent, id: activityEventId });
  }
);
