import { render } from '@react-email/components';
import React from 'react';

import { EmailTemplateWrapper } from '../src/email/EmailTemplateWrapper';
import { getMockPost } from '../src/mocks/posts.mock';
import { NotificationFreq } from '../src/shared/types/types.notifications';
import { AutopostOption } from '../src/shared/types/types.user';

const pkg = require('../build/render-email.js');
const { renderEmail } = pkg;

const USE_BUNDLE = true;

const root = document.getElementById('root');

if (USE_BUNDLE) {
  root
    ? (root.innerHTML = renderEmail(
        [getMockPost(), getMockPost(), getMockPost()],
        NotificationFreq.Daily,
        AutopostOption.MANUAL
      ))
    : null;
} else {
  root
    ? (root.innerHTML = render(
        React.createElement(EmailTemplateWrapper, {
          posts: [getMockPost(), getMockPost()],
          notificationFrequency: NotificationFreq.Daily,
          autopostOption: AutopostOption.MANUAL,
        })
      ))
    : null;
}
