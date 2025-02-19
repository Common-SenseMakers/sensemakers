import { DBInstance } from '../db/instance';
import { TASKS } from './types.tasks';

export interface TasksMeta {
  [TASKS.SYNC_POST_METRICS_TASK]: { lastBatchedPostId: string };
}

export class TasksRepository {
  constructor(protected db: DBInstance) {}

  async getTaskMeta<T extends keyof TasksMeta>(taskName: T) {
    const docId = taskName;
    const taskMetaDoc = await this.db.collections.tasks.doc(docId).get();
    return taskMetaDoc.data() as TasksMeta[T] | undefined;
  }

  async setTaskMeta<T extends keyof TasksMeta>(
    taskName: T,
    meta: TasksMeta[T]
  ) {
    const docId = taskName;
    await this.db.collections.tasks.doc(docId).set(meta);
  }
}
