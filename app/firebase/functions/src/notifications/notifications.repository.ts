import {
  Notification,
  NotificationCreate,
  NotificationStatus,
} from '../@shared/types/types.notifications';
import { DefinedIfTrue } from '../@shared/types/types.user';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class NotificationsRepository {
  constructor(protected db: DBInstance) {}

  private getBaseRepo(userId: string) {
    return new BaseRepository<Notification, NotificationCreate>(
      this.db.collections.userNotifications(userId),
      this.db
    );
  }

  public create(notification: NotificationCreate, manager: TransactionManager) {
    const repo = this.getBaseRepo(notification.userId);
    return repo.create(notification, manager);
  }

  public async get<T extends boolean, R = Notification>(
    userId: string,
    notificationId: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const repo = this.getBaseRepo(userId);
    return repo.get(notificationId, manager, shouldThrow);
  }

  public async getOfUser(userId: string, manager: TransactionManager) {
    const query = this.db.collections.userNotifications(userId);
    const snap = await manager.query(query);
    const ids = snap.docs.map((doc) => doc.id);

    return ids;
  }

  public async getUnotifiedOfUser(userId: string, manager: TransactionManager) {
    const status_property: keyof Notification = 'status';

    const query = this.db.collections
      .userNotifications(userId)
      .where(status_property, '==', NotificationStatus.pending);

    const snap = await manager.query(query);
    const ids = snap.docs.map((doc) => doc.id);

    return ids;
  }

  public async markAsNotified(
    userId: string,
    notificationId: string,
    manager: TransactionManager
  ) {
    const ref = this.db.collections
      .userNotifications(userId)
      .doc(notificationId);

    manager.update(ref, {
      status: NotificationStatus.sent,
    });
  }
}
