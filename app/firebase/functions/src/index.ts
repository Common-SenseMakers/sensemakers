import express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {
  FirestoreEvent,
  QueryDocumentSnapshot,
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
// import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { Message } from 'postmark';

import { ActivityEventBase } from './@shared/types/types.activity';
import { NotificationFreq } from './@shared/types/types.notifications';
import { PlatformPost } from './@shared/types/types.platform.posts';
import { AppPost } from './@shared/types/types.posts';
import { CollectionNames } from './@shared/utils/collectionNames';
import { activityEventCreatedHook } from './activity/activity.created.hook';
import { adminRouter } from './admin.router';
import {
  // AUTOFETCH_PERIOD,
  // DAILY_NOTIFICATION_PERIOD,
  EMAIL_SENDER_FROM,
  IS_EMULATOR, // MONTHLY_NOTIFICATION_PERIOD,
  // WEEKLY_NOTIFICATION_PERIOD,
} from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import { getServices } from './controllers.utils';
import { buildAdminApp, buildApp } from './instances/app';
import { logger } from './instances/logger';
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
import { getConfig } from './services.config';

// all secrets are available to all functions
const secrets = [
  envRuntime.ORCID_SECRET,
  envRuntime.OUR_TOKEN_SECRET,
  envRuntime.TWITTER_CLIENT_SECRET,
  envRuntime.TWITTER_BEARER_TOKEN,
  envRuntime.MASTODON_ACCESS_TOKENS,
  envRuntime.BLUESKY_APP_PASSWORD,
  envRuntime.NP_PUBLISH_RSA_PRIVATE_KEY,
  envRuntime.EMAIL_CLIENT_SECRET,
  envRuntime.MAGIC_ADMIN_SECRET,
];

export const appConfig = IS_EMULATOR
  ? {
      projectId: 'demo-sensenets',
    }
  : {};

const app = admin.initializeApp(appConfig);
const firestore = app.firestore();

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

exports['admin'] = functions
  .region(envDeploy.REGION)
  .runWith({
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets: [...secrets, envRuntime.ADMIN_API_KEY],
  })
  .https.onRequest(buildAdminApp(adminRouter));

/** jobs */
// exports.accountFetch = onSchedule(
//   {
//     schedule: AUTOFETCH_PERIOD,
//     secrets,
//   },
//   () => triggerAutofetchPosts(createServices(firestore))
// );

// exports.sendDailyNotifications = onSchedule(
//   {
//     schedule: DAILY_NOTIFICATION_PERIOD,
//     secrets,
//   },
//   () =>
//     triggerSendNotifications(NotificationFreq.Daily, createServices(firestore))
// );

// exports.sendWeeklyNotifications = onSchedule(
//   {
//     schedule: WEEKLY_NOTIFICATION_PERIOD,
//     secrets,
//   },
//   () =>
//     triggerSendNotifications(NotificationFreq.Weekly, createServices(firestore))
// );

// exports.sendMonthlyNotifications = onSchedule(
//   {
//     schedule: MONTHLY_NOTIFICATION_PERIOD,
//     secrets,
//   },
//   () =>
//     triggerSendNotifications(
//       NotificationFreq.Monthly,
//       createServices(firestore)
//     )
// );

/** tasks */
exports[PARSE_POST_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT_PARSER,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    maxInstances: 1,
    secrets,
    retryConfig: {
      maxAttempts: 5,
    },
    concurrency: 190,
    rateLimits: {
      maxConcurrentDispatches: 190,
      maxDispatchesPerSecond: 190,
    },
  },
  (req) => parsePostTask(req, createServices(firestore, getConfig()))
);

exports[AUTOFETCH_POSTS_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets,
    retryConfig: {
      maxAttempts: 1,
    },
  },
  async (req) => {
    void (await autofetchUserPosts(
      req,
      createServices(firestore, getConfig())
    ));
  }
);

exports[AUTOPOST_POST_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets,
  },
  (req) => autopostPostTask(req, createServices(firestore, getConfig()))
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

    return notifyUserTask(
      req.data.userId,
      createServices(firestore, getConfig())
    );
  }
);

const getBeforeAndAfterOnUpdate = <T>(
  event: FirestoreEvent<functions.Change<QueryDocumentSnapshot> | undefined>,
  idProperty: string
) => {
  const id = event.params[idProperty];
  const before = event.data?.before.data() as T;
  const after = event.data?.after.data() as T;

  if (!id || !before || !after) {
    throw new Error('Unexpected post data not found in onDocumentUpdated');
  }

  return {
    before: { ...before, id },
    after: { ...after, id },
  };
};

const getCreatedOnCreate = <T>(
  event: FirestoreEvent<QueryDocumentSnapshot | undefined>,
  idProperty: string
) => {
  const id = event.params[idProperty];
  const data = event.data?.data();

  if (!id || !data) {
    throw new Error('Unexpected data not found in onDocumentCreated');
  }

  return {
    id,
    ...data,
  } as T;
};

/** hooks */
exports.postUpdateListener = onDocumentUpdated(
  {
    document: `${CollectionNames.Posts}/{postId}`,
    secrets,
  },
  async (event) => {
    const { before, after } = getBeforeAndAfterOnUpdate<AppPost>(
      event,
      'postId'
    );
    await postUpdatedHook(
      after,
      createServices(firestore, getConfig()),
      before
    );
  }
);

exports.postCreateListener = onDocumentCreated(
  {
    document: `${CollectionNames.Posts}/{postId}`,
    secrets,
  },
  async (event) => {
    const created = getCreatedOnCreate<AppPost>(event, 'postId');
    await postUpdatedHook(created, createServices(firestore, getConfig()));
  }
);

exports.platformPostUpdateListener = onDocumentUpdated(
  {
    document: `${CollectionNames.PlatformPosts}/{platformPostId}`,
    secrets,
  },
  async (event) => {
    const { before, after } = getBeforeAndAfterOnUpdate<PlatformPost>(
      event,
      'platformPostId'
    );
    await platformPostUpdatedHook(
      after,
      createServices(firestore, getConfig()),
      before
    );
  }
);

exports.activityEventCreateListener = onDocumentCreated(
  {
    document: `${CollectionNames.Activity}/{activityEventId}`,
    secrets,
  },
  async (event) => {
    const created = getCreatedOnCreate<ActivityEventBase>(
      event,
      'activityEventId'
    );

    await activityEventCreatedHook(
      created,
      createServices(firestore, getConfig())
    );
  }
);

/** trigger endpoints to trigger scheduled tasks manually */
const emulatorTriggerRouter = express.Router();

emulatorTriggerRouter.post('/autofetch', async (request, response) => {
  logger.debug('autofetch triggered');
  await triggerAutofetchPosts(createServices(firestore, getConfig()));
  response.status(200).send({ success: true });
});

emulatorTriggerRouter.post('/sendNotifications', async (request, response) => {
  logger.debug('sendNotifications triggered');
  const params = request.query;
  if (!params.freq) {
    throw new Error('freq parameter is required');
  }

  await triggerSendNotifications(
    params.freq as NotificationFreq,
    getServices(request)
  );
  response.status(200).send({ success: true });
});

emulatorTriggerRouter.post('/emailTest', async (request, response) => {
  logger.debug('emailTest triggered');

  const services = createServices(firestore, getConfig());
  const message: Message = {
    From: EMAIL_SENDER_FROM.value(),
    ReplyTo: EMAIL_SENDER_FROM.value(),
    To: 'pepo@sense-nets.xyz',
    Subject: 'Test email',
    HtmlBody: '<h1>Test email</h1><p>This is a test email</p>',
    TextBody: 'Test email\nThis is a test email',
    MessageStream: 'outbound',
  };

  await services.email.callSendEmail(message);
  response.status(200).send({ success: true });
});

exports['trigger'] = functions
  .region(envDeploy.REGION)
  .runWith({
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets,
  })
  .https.onRequest(buildApp(emulatorTriggerRouter));

/** admin */
exports['admin'] = functions
  .region(envDeploy.REGION)
  .runWith({
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets: [...secrets, envRuntime.ADMIN_API_KEY],
  })
  .https.onRequest(buildAdminApp(adminRouter));
