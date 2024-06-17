import { ActivityEvent } from '../@shared/types/types.notifications';
import { DBInstance } from '../db/instance';
import { ActivityRepository } from './activity.repository';

export class NotificationService {
  constructor(
    public db: DBInstance,
    public repo: ActivityRepository
  ) {}

  public async sendNotification(activityEventId: string) {
    return this.db.run(async (manager) => {
      const activityEvent = await this.repo.get(activityEventId, manager, true);
      await this.sendNotificationInternal(activityEvent);
      await this.repo.markAsNotified(activityEventId, manager);
    });
  }
  async sendNotificationInternal(activityEvent: ActivityEvent) {}
}
