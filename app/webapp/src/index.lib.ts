import { render } from '@react-email/components';
import { t } from 'i18next';
import React from 'react';

import { I18Keys } from '../src/i18n/i18n';
import { EmailTemplate } from './email/EmailTemplate';
import { NotificationFreq } from './shared/types/types.notifications';
import {
  AppPostFull,
  AppPostRepublishedStatus,
} from './shared/types/types.posts';
import { AutopostOption, RenderEmailFunction } from './shared/types/types.user';

export const renderEmail: RenderEmailFunction = (
  posts: AppPostFull[],
  notificationFrequency: NotificationFreq,
  autopostOption: AutopostOption,
  appUrl: string
) => {
  const html = render(
    React.createElement(EmailTemplate, {
      posts,
      notificationFrequency,
      autopostOption,
      appUrl,
    })
  );

  const plainText = render(
    React.createElement(EmailTemplate, {
      posts,
      notificationFrequency,
      autopostOption,
      appUrl,
    }),
    { plainText: true }
  );

  const pointInTime = (() => {
    if (notificationFrequency === NotificationFreq.Daily) {
      return t(I18Keys.daily);
    }
    if (notificationFrequency === NotificationFreq.Weekly) {
      return t(I18Keys.weekly);
    }
    if (notificationFrequency === NotificationFreq.Monthly) {
      return t(I18Keys.monthly);
    }
  })();

  const subject = t(I18Keys.emailSubject, { pointInTime });

  return { html, plainText, subject };
};
