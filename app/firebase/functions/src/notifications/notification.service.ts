import { Message, ServerClient } from 'postmark';

import { ActivityType } from '../@shared/types/types.activity';
import {
  NotificationCreate,
  NotificationFreq,
  NotificationFull,
  PostParsedNotification,
} from '../@shared/types/types.notifications';
import { PLATFORM } from '../@shared/types/types.user';
import { AutopostOption } from '../@shared/types/types.user';
import { ActivityRepository } from '../activity/activity.repository';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { PostsHelper } from '../posts/posts.helper';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { getPostUrl } from './notification.utils';
import { NotificationsRepository } from './notifications.repository';

const postmark = require('postmark');

export const DEBUG = true;
export const DEBUG_PREFIX = `NOTIFICATION-SERVICE`;

export interface EmailPostDetails {
  content: string;
  url: string;
}

export interface EmailServiceConfig {
  apiKey: string;
}

export class NotificationService {
  protected postmark: ServerClient;

  constructor(
    public db: DBInstance,
    public notificationsRepo: NotificationsRepository,
    public postsRepo: PostsRepository,
    public activityRepo: ActivityRepository,
    public usersRepo: UsersRepository,
    config: EmailServiceConfig
  ) {
    this.postmark = new postmark.ServerClient(config.apiKey);
  }

  createNotification(
    notification: NotificationCreate,
    manager: TransactionManager
  ) {
    return this.notificationsRepo.create(notification, manager);
  }

  async getFull(
    userId: string,
    notificationId: string,
    manager: TransactionManager
  ): Promise<NotificationFull> {
    const notification = await this.notificationsRepo.get(
      userId,
      notificationId,
      manager,
      true
    );

    const activity = await this.activityRepo.get(
      notification.activityId,
      manager,
      true
    );

    return {
      ...notification,
      activity,
    };
  }

  /** Aggregates all pending notifications of a user and sends them as an email */
  async notifyUser(userId: string) {
    await this.db.run(async (manager) => {
      const user = await this.usersRepo.getUser(userId, manager, true);
      const settings = user.settings;

      /** get pending notificatations */
      const pendingIds = await this.notificationsRepo.getUnotifiedOfUser(
        userId,
        manager
      );

      const pendingNotifications = await Promise.all(
        pendingIds.map((notificationId) =>
          this.getFull(userId, notificationId, manager)
        )
      );

      /** check if user has enabled notififications */
      if (settings.notificationFreq === NotificationFreq.None) {
        return;
      }

      const autopostingOptions = [
        AutopostOption.AI,
        AutopostOption.DETERMINISTIC,
      ];

      if (
        autopostingOptions.includes(settings.autopost[PLATFORM.Nanopub].value)
      ) {
        await this.prepareAndSendDigestAuto(
          userId,
          pendingNotifications,
          manager
        );
      } else {
        await this.prepareAndSendDigestManual(
          userId,
          pendingNotifications,
          manager
        );
      }

      await Promise.all(
        pendingNotifications.map((n) =>
          this.notificationsRepo.markAsNotified(userId, n.id, manager)
        )
      );
    });
  }

  async getPostEmailDetails(
    notification: NotificationFull,
    types: ActivityType[],
    manager: TransactionManager
  ) {
    if (types.includes(notification.activity.type)) {
      const post = await this.postsRepo.get(
        (notification as PostParsedNotification).activity.data.postId,
        manager,
        true
      );

      const postText = PostsHelper.concatenateThread(post);

      return {
        content: postText,
        url: getPostUrl(post.id),
      };
    } else {
      throw new Error('Unsupported notification type');
    }
  }

  async prepareAndSendDigestManual(
    userId: string,
    notifications: NotificationFull[],
    manager: TransactionManager
  ) {
    /** */
    const postsDetails: EmailPostDetails[] = await Promise.all(
      notifications.map(async (notification) =>
        this.getPostEmailDetails(
          notification,
          [ActivityType.PostParsed],
          manager
        )
      )
    );

    await this.sendDigest(userId, postsDetails);
  }

  async prepareAndSendDigestAuto(
    userId: string,
    notifications: NotificationFull[],
    manager: TransactionManager
  ) {
    const postsDetails: EmailPostDetails[] = await Promise.all(
      notifications.map(async (notification) =>
        this.getPostEmailDetails(
          notification,
          [ActivityType.PostAutoposted],
          manager
        )
      )
    );

    await this.sendDigest(userId, postsDetails);
  }

  async sendDigest(userId: string, posts: EmailPostDetails[]) {
    const message: Message = {
      From: 'pepo@microrevolutions.com',
      To: 'pepo.ospina@gmail.com',
      Subject: 'Hello from Sensecast',
      HtmlBody: '<strong>Hello</strong> dear Postmark user.',
      TextBody: 'Hello dear Postmark user',
      MessageStream: 'outbound',
    };

    try {
      const res = await this.postmark.sendEmail(message);
      logger.debug(`sendDigest`, { res }, DEBUG_PREFIX);
    } catch (e) {
      logger.error(`sendDigest`, { e }, DEBUG_PREFIX);
    }
  }
}
