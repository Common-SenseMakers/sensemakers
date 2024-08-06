import { render } from '@react-email/components';
import React from 'react';
import ReactDOM from 'react-dom';

import { EmailTemplate } from '../src/email/EmailTemplate';
import { renderEmail as renderEmailUnbundled } from '../src/index.lib';
import {
  getMockAutoPublishedPost,
  getMockPendingPost,
  getMockPublishedPost,
} from '../src/shared/mocks/posts.mock';
import { NotificationFreq } from '../src/shared/types/types.notifications';

const pkg = require('../build/index.js');
const { renderEmail } = pkg;

const USE_BUNDLE = false;
const NOTIFICATION_FREQUENCY = NotificationFreq.Weekly;
const APP_URL = 'http://localhost:3000';

const posts = [
  getMockPendingPost(),
  getMockPendingPost(),
  getMockPendingPost(),
  getMockPendingPost(),
  getMockAutoPublishedPost(),
  getMockAutoPublishedPost(),
  getMockAutoPublishedPost(),
  getMockAutoPublishedPost(),
  getMockAutoPublishedPost(),
  getMockPublishedPost(),
  getMockPublishedPost(),
];

const { html, subject } = (() => {
  if (USE_BUNDLE) {
    return renderEmail(posts, NOTIFICATION_FREQUENCY, APP_URL);
  } else {
    return renderEmailUnbundled(posts, NOTIFICATION_FREQUENCY, APP_URL);
  }
})();
console.log(subject);

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
