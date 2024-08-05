import { render } from '@react-email/components';
import { t } from 'i18next';
import React from 'react';

import { I18Keys } from '../src/i18n/i18n';
import { EmailTemplate } from './email/EmailTemplate';
import { NotificationFreq } from './shared/types/types.notifications';
import { AppPostFull } from './shared/types/types.posts';
import { RenderEmailFunction } from './shared/types/types.user';

export const renderEmail: RenderEmailFunction = (
  posts: AppPostFull[],
  notificationFrequency: NotificationFreq,
  appUrl: string
) => {
  const html = render(
    React.createElement(EmailTemplate, {
      posts,
      notificationFrequency,
      appUrl,
    })
  );

  const plainText = render(
    React.createElement(EmailTemplate, {
      posts,
      notificationFrequency,
      appUrl,
    }),
    { plainText: true }
  );

  const timeframe = (() => {
    if (notificationFrequency === NotificationFreq.Daily) {
      return t(I18Keys.Daily);
    }
    if (notificationFrequency === NotificationFreq.Weekly) {
      return t(I18Keys.Weekly);
    }
    if (notificationFrequency === NotificationFreq.Monthly) {
      return t(I18Keys.Monthly);
    }
  })();

  const subject = t(I18Keys.emailSubject, { timeframe });

  return { html, plainText, subject };
};
