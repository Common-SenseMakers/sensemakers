import { DBInstance } from '../db/instance';
import { JOBS } from './types.jobs';

export interface JobsMeta {
  [JOBS.SYNC_POST_METRICS]: { lastBatchedPostId: string };
}

export class JobsRepository {
  constructor(protected db: DBInstance) {}

  async getJobMeta<T extends keyof JobsMeta>(taskName: T) {
    const docId = taskName;
    const taskMetaDoc = await this.db.collections.jobs.doc(docId).get();
    return taskMetaDoc.data() as JobsMeta[T] | undefined;
  }

  async setJobMeta<T extends keyof JobsMeta>(taskName: T, meta: JobsMeta[T]) {
    const docId = taskName;
    await this.db.collections.jobs.doc(docId).set(meta);
  }
}
