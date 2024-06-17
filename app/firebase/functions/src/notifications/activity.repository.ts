import {
  ActivityEvent,
  ActivityEventCreate,
} from '../@shared/types/types.notifications';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class ActivityRepository extends BaseRepository<
  ActivityEvent,
  ActivityEventCreate
> {
  constructor(protected db: DBInstance) {
    super(db.collections.activity);
  }

  public async getUnotifiedOfUser(userId: string) {
    const userId_property: keyof ActivityEvent = 'userId';
    const notified_property: keyof ActivityEvent = 'notified';

    const snap = await this.db.collections.activity
      .where(userId_property, '==', userId)
      .where(notified_property, '==', false)
      .orderBy('timestamp')
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ActivityEvent[];
  }
  public async markAsNotified(id: string, manager: TransactionManager) {
    return manager.update(this.db.collections.activity.doc(id), {
      notified: true,
    });
  }
}
