import {
  Notification,
  NotificationStatus,
} from '../@shared/types/types.notifications';
import { DBInstance } from '../db/instance';

export class NotificationsRepository {
  constructor(protected db: DBInstance) {}

  public async getUnotifiedOfUser(userId: string) {
    const status_property: keyof Notification<any> = 'status';

    const snap = await this.db.collections
      .userNotifications(userId)
      .where(status_property, '==', NotificationStatus.pending)
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification<any>[];
  }
}
