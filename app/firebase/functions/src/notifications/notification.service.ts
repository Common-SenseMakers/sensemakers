import { ActivityType } from '../@shared/types/types.activity';
import {
  NotificationCreate,
  NotificationFreq,
  NotificationFull,
  PostParsedNotification,
} from '../@shared/types/types.notifications';
import { PlatformPost } from '../@shared/types/types.platform.posts';
import { AppPostFull } from '../@shared/types/types.posts';
import { PLATFORM } from '../@shared/types/types.user';
import { AutopostOption } from '../@shared/types/types.user';
import { ActivityRepository } from '../activity/activity.repository';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { EmailSenderService } from '../emailSender/email.sender.service';
import { logger } from '../instances/logger';
import { PlatformPostsRepository } from '../posts/platform.posts.repository';
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
    public platformPostsRepo: PlatformPostsRepository,
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
      if (DEBUG) {
        logger.debug(
          `notifyUser ${userId} - getting user`,
          { userId },
          DEBUG_PREFIX
        );
      }
      const user = await this.usersRepo.getUser(userId, manager, true);
      const settings = user.settings;

      if (DEBUG) {
        logger.debug(
          `notifyUser ${userId} - user got, getting pending notifications`,
          { user },
          DEBUG_PREFIX
        );
      }

      /** get pending notificatations */
      const pendingIds = await this.notificationsRepo.getUnotifiedOfUser(
        userId,
        manager
      );

      if (DEBUG) {
        logger.debug(`pending got ${userId}`, { pendingIds }, DEBUG_PREFIX);
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
        pendingNotifications.map(async (n) => {
          if (DEBUG) {
            logger.debug(
              `notifyUser ${userId} - markAsNotified`,
              { n, userId },
              DEBUG_PREFIX
            );
          }

          return this.notificationsRepo.markAsNotified(userId, n.id, manager);
        })
      );
    });
  }

  async getPostEmailDetails(
    notification: NotificationFull,
    types: ActivityType[],
    manager: TransactionManager
  ): Promise<AppPostFull> {
    if (types.includes(notification.activity.type)) {
      const post = await this.postsRepo.get(
        (notification as PostParsedNotification).activity.data.postId,
        manager,
        true
      );

      const mirrors = await Promise.all(
        post.mirrorsIds.map((mirrorId) =>
          this.platformPostsRepo.get(mirrorId, manager)
        )
      );

      return {
        ...post,
        mirrors: mirrors.filter((m) => m !== undefined) as PlatformPost[],
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
    const appPostFulls: AppPostFull[] = await Promise.all(
      notifications.map(async (notification) =>
        this.getPostEmailDetails(
          notification,
          [ActivityType.PostParsed],
          manager
        )
      )
    );

    await this.sendDigest(userId, appPostFulls);
  }

  async prepareAndSendDigestAuto(
    userId: string,
    notifications: NotificationFull[],
    manager: TransactionManager
  ) {
    const postsDetails: AppPostFull[] = await Promise.all(
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

  async sendDigest(userId: string, posts: AppPostFull[]) {
    try {
      const user = await this.db.run((manager) =>
        this.usersRepo.getUser(userId, manager, true)
      );
      const res = await this.emailSender.sendUserDigest(user, posts);
      if (DEBUG) logger.debug(`sendDigest`, { res }, DEBUG_PREFIX);
    } catch (e) {
      logger.error(`error in sendUserDigest`, { e }, DEBUG_PREFIX);
    }
  }
}
