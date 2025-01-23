import fs from 'fs';
import path from 'path';
import {
  BatchComplianceJobV2,
  BatchComplianceV2JobResult,
  BatchComplianceV2Result,
  TwitterApi,
} from 'twitter-api-v2';

export class TwitterJobManager {
  private readonly client: TwitterApi;

  constructor(bearerToken: string) {
    this.client = new TwitterApi(bearerToken);
  }

  async createAndTriggerJob(
    jobName: string,
    jobType: 'tweets' | 'users',
    postIds: string[]
  ): Promise<BatchComplianceV2Result> {
    try {
      const job = await this.client.v2.sendComplianceJob({
        type: jobType,
        name: jobName,
        ids: postIds,
      });
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }
  }

  async getJobResults(
    job: BatchComplianceJobV2
  ): Promise<BatchComplianceV2JobResult[]> {
    try {
      const results = await this.client.v2.complianceJobResult(job);
      return results;
    } catch (error) {
      throw new Error('Failed to trigger job');
    } finally {
      fs.unlinkSync(path.join(__dirname, 'post_ids.txt'));
    }
  }
}
