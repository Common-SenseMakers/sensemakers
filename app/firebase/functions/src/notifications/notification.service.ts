import {
  ACTIVITY_EVENT_TYPE,
  ActivityEvent,
  Notification,
} from '../@shared/types/types.notifications';
import {
  AutopostOption,
  PLATFORM,
  UserSettings,
} from '../@shared/types/types.user';
import { DBInstance } from '../db/instance';
import { ActivityRepository } from './activity.repository';

export class NotificationService {
  constructor(
    public db: DBInstance,
    public repo: ActivityRepository
  ) {}

  public async sendNotification(notification: Notification) {
    return this.db.run(async (manager) => {
      await this.sendNotificationInternal(notification);
      await Promise.all(
        notification.activityEventIds.map((activityEventId) => {
          return this.repo.markAsNotified(activityEventId, manager);
        })
      );
    });
  }
  async sendNotificationInternal(notification: Notification) {}
  async notifyUser(userId: string, settings: UserSettings) {
    const autopostingOptions = [
      AutopostOption.AI,
      AutopostOption.DETERMINISTIC,
    ];
    const activityEvents = await this.repo.getUnotifiedOfUser(userId);
    let notification = await (async () => {
      if (
        autopostingOptions.includes(settings.autopost[PLATFORM.Nanopub].value)
      ) {
        const autopostedEvents = activityEvents.filter((activityEvent) => {
          return activityEvent.type === ACTIVITY_EVENT_TYPE.PostAutoposted;
        });
        return await this.createNotificationObject(
          autopostedEvents,
          userId,
          ACTIVITY_EVENT_TYPE.PostAutoposted
        );
      } else if (
        settings.autopost[PLATFORM.Nanopub].value === AutopostOption.MANUAL
      ) {
        const manualEvents = activityEvents.filter((activityEvent) => {
          return activityEvent.type === ACTIVITY_EVENT_TYPE.PostsParsed;
        });
        return await this.createNotificationObject(
          manualEvents,
          userId,
          ACTIVITY_EVENT_TYPE.PostsParsed
        );
      } else {
        throw new Error('Invalid autopost option');
      }
    })();
    this.sendNotification(notification);
  }
  async createNotificationObject(
    activityEvents: ActivityEvent[],
    userId: string,
    activityEventType: ACTIVITY_EVENT_TYPE
  ): Promise<Notification> {
    /** TODO: this is where we could create a notification document in a notification collection */
    const notification = (() => {
      if (activityEventType === ACTIVITY_EVENT_TYPE.PostsParsed) {
        return {
          title: 'Posts Ready For Review',
          body: `You have ${activityEvents.length} potential nanopublications ready for review!`,
        };
      } else if (activityEventType === ACTIVITY_EVENT_TYPE.PostAutoposted) {
        return {
          title: 'Posts Autoposted',
          body: `You have ${activityEvents.length} new nanopublication`,
        };
      } else {
        throw new Error('Invalid activity event type');
      }
    })();
    return {
      ...notification,
      userId,
      activityEventType,
      activityEventIds: activityEvents.map((event) => event.id),
    };
  }
}
