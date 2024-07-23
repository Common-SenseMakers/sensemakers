import { render } from '@react-email/components';
import React from 'react';
import ReactDOM from 'react-dom';

import { EmailTemplate } from '../src/email/EmailTemplate';
import { renderEmail as renderEmailUnbundled } from '../src/index.lib';
import { getMockPost } from '../src/mocks/posts.mock';
import { NotificationFreq } from '../src/shared/types/types.notifications';
import { AutopostOption } from '../src/shared/types/types.user';

const pkg = require('../build/index.js');
const { renderEmail } = pkg;

const USE_BUNDLE = true;
const NUM_POSTS = 6;
const NOTIFICATION_FREQUENCY = NotificationFreq.Daily;
const AUTOPOST_OPTION = AutopostOption.MANUAL;
const APP_URL = 'http://localhost:3000';

const posts = [
  getMockPost(),
  getMockPost(),
  getMockPost(),
  getMockPost(),
  getMockPost(),
  getMockPost(),
  getMockPost(),
  getMockPost(),
];

const html = (() => {
  if (USE_BUNDLE) {
    return renderEmail(
      posts.slice(0, NUM_POSTS),
      NOTIFICATION_FREQUENCY,
      AUTOPOST_OPTION,
      APP_URL
    ).html;
  } else {
    return renderEmailUnbundled(
      posts.slice(0, NUM_POSTS),
      NOTIFICATION_FREQUENCY,
      AUTOPOST_OPTION,
      APP_URL
    ).html;
  }
})();
console.log(html);

const root = document.getElementById('root');
root ? (root.innerHTML = html) : null;
// ReactDOM.render(
//   React.createElement(EmailTemplate, {
//     posts: posts.slice(0, NUM_POSTS),
//     notificationFrequency: NOTIFICATION_FREQUENCY,
//     autopostOption: AUTOPOST_OPTION,
//     appUrl: APP_URL,
//   }),
//   root
// );
