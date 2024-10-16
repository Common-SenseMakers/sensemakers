import { Message, ServerClient } from 'postmark';

import { AppPostFull } from '../@shared/types/types.posts';
import { AppUser } from '../@shared/types/types.user';
import { RenderEmailFunction } from '../@shared/types/types.user';
import {
  ADMIN_EMAIL,
  APP_URL,
  EMAIL_SENDER_FROM,
} from '../config/config.runtime';
import { logger } from '../instances/logger';
import { cleanHtml } from './utils';

const { renderEmail } = require('../@shared/emailRenderer') as {
  renderEmail: RenderEmailFunction;
};

const postmark = require('postmark');

export const DEBUG = false;
export const DEBUG_PREFIX = `EMAIL-SENDER-SERVICE`;

export enum EmailType {
  userNotification = 'userNotification',
  emailVerification = 'emailVerification',
}

export interface EmailPostDetails {
  content: string;
  url: string;
}

export interface EmailServiceConfig {
  apiKey: string;
}

export class EmailSenderService {
  protected postmark: ServerClient;

  constructor(config: EmailServiceConfig) {
    if (DEBUG)
      logger.debug(
        'EMAIL-SENDER-SERVICE - constructor',
        { key: config.apiKey.slice(0, 8) },
        DEBUG_PREFIX
      );
    this.postmark = new postmark.ServerClient(config.apiKey);
  }

  async callSendEmail(message: Message) {
    if (message.HtmlBody) {
      message.HtmlBody = cleanHtml(message.HtmlBody);
    }
    const res = await this.postmark.sendEmail(message);
    logger.debug(`sendDigest - success`, { res }, DEBUG_PREFIX);
  }

  async sendAdminEmail(subject: string, content: string) {
    const adminEmail = ADMIN_EMAIL.value();

    if (!adminEmail || adminEmail === '') {
      logger.debug('sendAdminEmail - no admin email', {}, DEBUG_PREFIX);
      return;
    }

    const message: Message = {
      From: EMAIL_SENDER_FROM.value(),
      ReplyTo: EMAIL_SENDER_FROM.value(),
      To: adminEmail,
      Subject: subject,
      TextBody: content,
      MessageStream: 'outbound',
    };

    try {
      await this.callSendEmail(message);
    } catch (e) {
      logger.error(`Error on callSendEmail`, { e, message }, DEBUG_PREFIX);
      throw e;
    }
  }

  async sendUserDigest(user: AppUser, posts: AppPostFull[]) {
    if (!user.email) {
      throw new Error(`User ${user.userId} has no email`);
    }

    const appUrl = APP_URL.value();

    if (!appUrl) {
      throw new Error(`APP_URL is not set`);
    }

    const { html, plainText, subject } = renderEmail(
      posts,
      user.settings.notificationFreq,
      appUrl
    );

    const message: Message = {
      From: EMAIL_SENDER_FROM.value(),
      ReplyTo: EMAIL_SENDER_FROM.value(),
      To: user.email?.email,
      Subject: subject,
      HtmlBody: html,
      TextBody: plainText,
      MessageStream: 'outbound',
    };

    try {
      await this.callSendEmail(message);
    } catch (e) {
      logger.error(`Error on callSendEmail`, { e, message }, DEBUG_PREFIX);
      throw e;
    }
  }
}
