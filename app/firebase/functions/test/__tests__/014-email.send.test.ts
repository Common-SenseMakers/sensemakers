import fs from 'fs';
import { Message } from 'postmark';

import {
  getMockAutoPublishedPost,
  getMockPendingPost,
  getMockPublishedPost,
} from '../../src/@shared/mocks/posts.mock';
import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { AppPostFull } from '../../src/@shared/types/types.posts';
import { RenderEmailFunction } from '../../src/@shared/types/types.user';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
} from './reusable/create-post-fetch';
import {
  EMAIL_SENDER_FROM,
  EMAIL_SENDER_TO,
  globalTestServices,
} from './setup';

const { renderEmail } = require('../../src/@shared/emailRenderer') as {
  renderEmail: RenderEmailFunction;
};

const services = globalTestServices;

describe.only('014-email.send', () => {
  describe('create and process', () => {
    it('sends a formatted users email', async () => {
      const posts: AppPostFull[] = [
        getMockAutoPublishedPost(),
        getMockAutoPublishedPost(),
        getMockAutoPublishedPost(),
        getMockAutoPublishedPost(),
        getMockPendingPost(),
        getMockPendingPost(),
        getMockPendingPost(),
        getMockPublishedPost(),
        getMockPublishedPost(),
        getMockPublishedPost(),
        getMockPublishedPost(),
        getMockPublishedPost(),
      ];
      const { html, plainText, subject } = renderEmail(
        posts,
        NotificationFreq.Daily,
        'http://localhost:3000/'
      );

      const message: Message = {
        From: EMAIL_SENDER_FROM,
        ReplyTo: EMAIL_SENDER_FROM,
        To: EMAIL_SENDER_TO ? EMAIL_SENDER_TO : 'wesleyfinck@gmail.com',
        Subject: subject,
        HtmlBody: html,
        TextBody: plainText,
        MessageStream: 'outbound',
      };

      fs.writeFileSync('test.email.html', message.HtmlBody as string);

      await services.email.callSendEmail(message);
    });
  });
});
