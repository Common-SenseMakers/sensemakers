import express from 'express';
import * as functions from 'firebase-functions';
import {
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';

import { CollectionNames } from './@shared/utils/collectionNames';
import { AUTOFETCH_PERIOD, IS_EMULATOR } from './config/config.runtime';
import { envDeploy } from './config/typedenv.deploy';
import { envRuntime } from './config/typedenv.runtime';
import { buildApp } from './instances/app';
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

// import { fetchNewPosts } from './posts/posts.job';

/** Registed the API as an HTTP triggered function */
exports['api'] = functions
  .region(envDeploy.REGION)
  .runWith({
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
    secrets: [
      envRuntime.ORCID_SECRET,
      envRuntime.OUR_TOKEN_SECRET,
      envRuntime.TWITTER_CLIENT_SECRET,
      envRuntime.NP_PUBLISH_RSA_PRIVATE_KEY
    ],
  })
  .https.onRequest(buildApp(router));

/** jobs */
exports.accountFetch = onSchedule(AUTOFETCH_PERIOD, triggerAutofetchPosts);

// add enpoint when on emulator to trigger the scheduled task
if (IS_EMULATOR) {
  const scheduledTriggerRouter = express.Router();

  scheduledTriggerRouter.post('/autofetch', async (request, response) => {
    await triggerAutofetchPosts();
    response.status(200).send({ success: true });
  });

  exports['trigger'] = functions
    .region(envDeploy.REGION)
    .runWith({
      timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
      memory: envDeploy.CONFIG_MEMORY,
      minInstances: envDeploy.CONFIG_MININSTANCE,
      secrets: [
        envRuntime.ORCID_SECRET,
        envRuntime.OUR_TOKEN_SECRET,
        envRuntime.TWITTER_CLIENT_SECRET,
        envRuntime.NP_PUBLISH_RSA_PRIVATE_KEY
      ],
    })
    .https.onRequest(buildApp(scheduledTriggerRouter));
}

/** tasks */
exports[PARSE_POST_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
  },
  parsePostTask
);

exports[AUTOFETCH_POSTS_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
  },
  autofetchUserPosts
);

exports[AUTOPOST_POST_TASK] = onTaskDispatched(
  {
    timeoutSeconds: envDeploy.CONFIG_TIMEOUT,
    memory: envDeploy.CONFIG_MEMORY,
    minInstances: envDeploy.CONFIG_MININSTANCE,
  },
  autopostPostTask
);

/** hooks */
exports.postUpdateListener = onDocumentUpdated(
  `${CollectionNames.Posts}/{postId}`,
  (event) => postUpdatedHook(event.params?.postId)
);

exports.postCreateListener = onDocumentCreated(
  `${CollectionNames.Posts}/{postId}`,
  (event) => postUpdatedHook(event.params?.postId)
);

exports.platformPostUpdateListener = onDocumentUpdated(
  `${CollectionNames.PlatformPosts}/{platformPostId}`,
  platformPostUpdatedHook
);
