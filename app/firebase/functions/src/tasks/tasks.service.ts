import { TaskOptions, getFunctions } from 'firebase-admin/functions';
import { GoogleAuth } from 'google-auth-library';

import { NODE_ENV, PROJECT_ID } from '../config/config.runtime';
import { envRuntime } from '../config/typedenv.runtime';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import { TASK, TasksParams } from './types.tasks';

export class TasksService {
  private async getFunctionUrl(name: string, location: string) {
    let auth: GoogleAuth | undefined = undefined;
    if (!auth) {
      auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
        projectId: PROJECT_ID.value(),
      });
    }
    const projectId = await auth.getProjectId();
    if (envRuntime.NODE_ENV !== 'production') {
      return `http://127.0.0.1:5001/${projectId}/${location}/${name}`;
    }

    const url =
      'https://cloudfunctions.googleapis.com/v2beta/' +
      `projects/${projectId}/locations/${location}/functions/${name}`;

    const client = await auth.getClient();
    const res = await client.request<{ serviceConfig: { uri: string } }>({
      url,
    });

    const realUri = res.data?.serviceConfig?.uri;

    if (!realUri) {
      throw new Error(`Unable to retreive uri for function at ${url}`);
    }
    return realUri;
  }

  async enqueue<T extends TASK>(
    name: T,
    params: TasksParams[T],
    taskOptions?: TaskOptions,
    services?: Services // user for mock
  ) {
    logger.debug(`enqueueTask ${name} on ${NODE_ENV}`, {
      params,
      NODE_ENV,
    });

    const location = envRuntime.REGION || 'us-central1';
    const targetUri = await this.getFunctionUrl(name, location);

    const queue = getFunctions().taskQueue(name);
    /** enqueue */
    logger.debug(`enqueue ${name}`, { params, targetUri });

    return queue.enqueue(params, { ...taskOptions, uri: targetUri });
  }
}
