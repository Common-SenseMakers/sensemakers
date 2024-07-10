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
import { EmailSenderService } from '../emailSender/email.sender.service';
import { logger } from '../instances/logger';
import { PostsHelper } from '../posts/posts.helper';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { NotificationsRepository } from './notifications.repository';

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
  constructor(
    public db: DBInstance,
    public notificationsRepo: NotificationsRepository,
    public postsRepo: PostsRepository,
    public activityRepo: ActivityRepository,
    public usersRepo: UsersRepository,
    public emailSender: EmailSenderService
  ) {}

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

      if (DEBUG) {
        logger.debug(`notifyUser ${userId}`, { pendingIds }, DEBUG_PREFIX);
      }

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

      if (pendingNotifications.length === 0) {
        logger.debug(
          `notifyUser ${userId} - no pending notifications`,
          undefined,
          DEBUG_PREFIX
        );
        return;
      }

      if (
        autopostingOptions.includes(settings.autopost[PLATFORM.Nanopub].value)
      ) {
        if (DEBUG) {
          logger.debug(
            `notifyUser ${userId} - prepareAndSendDigestAuto`,
            { pendingNotifications },
            DEBUG_PREFIX
          );
        }

        await this.prepareAndSendDigestAuto(
          userId,
          pendingNotifications,
          manager
        );
      } else {
        if (DEBUG) {
          logger.debug(
            `notifyUser ${userId} - prepareAndSendDigestManual`,
            { pendingNotifications },
            DEBUG_PREFIX
          );
        }

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

      const postText = PostsHelper.concatenateThread(post.generic);

      return {
        content: postText,
        url: PostsHelper.getPostUrl(post.id),
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
    try {
      const user = await this.db.run((manager) =>
        this.usersRepo.getUser(userId, manager, true)
      );
      const res = await this.emailSender.sendUserDigest(user, posts);
      logger.debug(`sendDigest`, { res }, DEBUG_PREFIX);
    } catch (e) {
      logger.error(`sendDigest`, { e }, DEBUG_PREFIX);
    }
  }
}
