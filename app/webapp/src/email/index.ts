import { render } from '@react-email/components';
import React from 'react';
import { ServerStyleSheet } from 'styled-components';

import { AppPostFull } from '../shared/types/types.posts';
import { EmailTemplate } from './EmailTemplate';

export const renderEmail = (posts: AppPostFull[]) => {
  const sheet = new ServerStyleSheet();
  const html = render(
    sheet.collectStyles(React.createElement(EmailTemplate, { posts }))
  );
  const styleTags = sheet.getStyleTags();
  return `${styleTags}${html}`;
};
