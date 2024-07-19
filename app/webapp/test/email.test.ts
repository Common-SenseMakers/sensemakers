import { render } from '@react-email/components';
import React from 'react';

import { EmailTemplateWrapper } from '../src/email/EmailTemplateWrapper';
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

const root = document.getElementById('root');

if (USE_BUNDLE) {
  root
    ? (root.innerHTML = renderEmail(
        posts.slice(0, NUM_POSTS),
        NOTIFICATION_FREQUENCY,
        AUTOPOST_OPTION,
        APP_URL
      ).html)
    : null;
} else {
  root
    ? (root.innerHTML = render(
        React.createElement(EmailTemplateWrapper, {
          posts: posts.slice(0, NUM_POSTS),
          notificationFrequency: NOTIFICATION_FREQUENCY,
          autopostOption: AUTOPOST_OPTION,
          appUrl: APP_URL,
        })
      ))
    : null;
}
