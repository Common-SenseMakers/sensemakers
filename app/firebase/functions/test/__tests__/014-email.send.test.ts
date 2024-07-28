import fs from 'fs';
import { Message } from 'postmark';

import { logger } from '../../src/instances/logger';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
} from './reusable/create-post-fetch';
// import { html } from './sample.html';
// import { sampleHtml } from './sample.html';
import { EMAIL_SENDER_FROM, globalTestServices } from './setup';
import { sampleHtml } from './sample.html';

const services = globalTestServices;

describe.only('014-email.send', () => {
  describe('create and process', () => {
    it('sets users email', async () => {
      logger.debug('emailTest triggered');

      // const sampleHtml = `<p>\ud83d</p>`;

      const message: Message = {
        From: EMAIL_SENDER_FROM,
        ReplyTo: EMAIL_SENDER_FROM,
        To: 'pepo@sense-nets.xyz',
        Subject: 'Test email',
        HtmlBody: sampleHtml,
        MessageStream: 'outbound',
      };

      fs.writeFileSync('test.email.html', message.HtmlBody as string);

      await services.email.callSendEmail(message);
    });
  });
});
