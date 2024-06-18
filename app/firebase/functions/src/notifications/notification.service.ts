import { ACTIVITY_EVENT_TYPE } from '../@shared/types/types.activity';
import {
  NOTIFICATION_FREQUENCY,
  Notification,
  PostParsedNotification,
} from '../@shared/types/types.notifications';
import { AppPost } from '../@shared/types/types.posts';
import { PLATFORM } from '../@shared/types/types.user';
import { AutopostOption, UserSettings } from '../@shared/types/types.user';
import { DBInstance } from '../db/instance';
import { NotificationsRepository } from './notifications.repository';

interface EmailPostDetails {
  title: string;
  content: string;
  url: string;
}

export class NotificationService {
  constructor(
    public db: DBInstance,
    public repo: NotificationsRepository,
    public posts: PostService
  ) {}

  /** Aggregates all pending notifications of a user and sends them as an email */
  async notifyUser(userId: string, settings: UserSettings) {
    /** get pending notificatations */
    const pendingNotifications = await this.repo.getUnotifiedOfUser(userId);

    /** check if user has enabled notififications */
    if (settings.notificationFrequency === NOTIFICATION_FREQUENCY.None) {
      return;
    }

    const autopostingOptions = [
      AutopostOption.AI,
      AutopostOption.DETERMINISTIC,
    ];

    if (
      autopostingOptions.includes(settings.autopost[PLATFORM.Nanopub].value)
    ) {
      await this.sendDigestAuto(userId, pendingNotifications);
    } else {
      await this.sendDigestManual(userId, pendingNotifications);
    }
  }

  async sendDigestManual(userId: string, notifications: Notification[]) {
    /** */
    const postsToPublish: EmailPostDetails[] = await Promise.all(
      notifications.map(async (notification) => {
        if (notification.activity.type === ACTIVITY_EVENT_TYPE.PostParsed) {
          const post = await this.posts.get(
            notification as PostParsedNotification,
            true
          );
          WIP WIP
          return {
            title: post.title,
            content: post.content,
            url: post.url,
          };
        } else {
          throw new Error('Unsupported notification type');
        }
      })
    );
  }

  async sendDigestAuto(userId: string, notifications: Notification[]) {
    const postsPublished: AppPost[] = [];
  }
}
