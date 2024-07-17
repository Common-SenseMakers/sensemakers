import { render } from '@react-email/components';
import React from 'react';
import { ServerStyleSheet } from 'styled-components';

import { NotificationFreq } from '../shared/types/types.notifications';
import { AppPostFull } from '../shared/types/types.posts';
import {
  AutopostOption,
  RenderEmailFunction,
} from '../shared/types/types.user';
import { EmailTemplateWrapper } from './EmailTemplateWrapper';

export const renderEmail: RenderEmailFunction = (
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

  const plainText = render(
    sheet.collectStyles(
      React.createElement(EmailTemplateWrapper, {
        posts,
        notificationFrequency,
        autopostOption,
      })
    ),
    { plainText: true }
  );
  const styleTags = sheet.getStyleTags();
  return { html: `${styleTags}${html}`, plainText };
};
