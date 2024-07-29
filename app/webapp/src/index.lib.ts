import { render } from '@react-email/components';
import React from 'react';

import { EmailTemplate } from './email/EmailTemplate';
import { NotificationFreq } from './shared/types/types.notifications';
import { AppPostFull } from './shared/types/types.posts';
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

  const subject =
    autopostOption === AutopostOption.MANUAL
      ? `We found ${posts.length} new posts for review`
      : `We have FAIRified ${posts.length} new posts for you`;

  return { html, plainText, subject };
};
