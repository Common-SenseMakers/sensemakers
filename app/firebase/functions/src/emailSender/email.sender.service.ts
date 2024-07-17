import { Message, ServerClient } from 'postmark';

import { AppPostFull } from '../@shared/types/types.posts';
import {
  AppUser,
  PLATFORM,
  RenderEmailFunction,
} from '../@shared/types/types.user';
import { logger } from '../instances/logger';

const renderEmailPkg = require('../@shared/render-email.js');

const { renderEmail } = renderEmailPkg as { renderEmail: RenderEmailFunction };

const postmark = require('postmark');

export const DEBUG = true;
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
    this.postmark = new postmark.ServerClient(config.apiKey);
  }

  private async callSendEmail(message: Message) {
    try {
      const res = await this.postmark.sendEmail(message);
      logger.debug(`sendDigest - success`, { res }, DEBUG_PREFIX);
    } catch (e) {
      logger.error(`sendDigest - error`, { e }, DEBUG_PREFIX);
    }
  }

  async sendUserDigest(user: AppUser, posts: AppPostFull[]) {
    if (!user.email) {
      throw new Error(`User ${user.userId} has no email`);
    }

    const { html, plainText } = renderEmail(
      posts,
      user.settings.notificationFreq,
      user.settings.autopost[PLATFORM.Nanopub].value
    );

    const message: Message = {
      From: ' pepo@microrevolutions.com',
      To: user.email?.email,
      Subject: 'Hello from Sensecast',
      HtmlBody: html,
      TextBody: plainText,
      MessageStream: 'outbound',
    };

    await this.callSendEmail(message);
  }
}
