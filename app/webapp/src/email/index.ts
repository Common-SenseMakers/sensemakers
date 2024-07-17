import { render } from '@react-email/components';
import React from 'react';
import { ServerStyleSheet } from 'styled-components';

import { NotificationFreq } from '../shared/types/types.notifications';
import { AppPostFull } from '../shared/types/types.posts';
import { AutopostOption } from '../shared/types/types.user';
import { EmailTemplateWrapper } from './EmailTemplateWrapper';

export const renderEmail = (
  posts: AppPostFull[],
  notificationFrequency: NotificationFreq,
  autopostOption: AutopostOption
) => {
  const sheet = new ServerStyleSheet();
  const html = render(
    sheet.collectStyles(
      React.createElement(EmailTemplateWrapper, {
        posts,
        notificationFrequency,
        autopostOption,
      })
    )
  );
  const styleTags = sheet.getStyleTags();
  return `${styleTags}${html}`;
};
