import { DBInstance } from '../db/instance';
import { ActivityRepository } from './activity.repository';

export class NotificationService {
  constructor(
    public db: DBInstance,
    public repo: ActivityRepository
  ) {}

  public sendNotification(activityEventId: string) {
    return this.db.run(async (manager) => {
      const activityEvent = await this.repo.get(activityEventId, manager, true);
      /** send email here */
      console.log('Sending email to', activityEvent.userId);
      await this.repo.markAsNotified(activityEventId, manager);
    });
  }
}
