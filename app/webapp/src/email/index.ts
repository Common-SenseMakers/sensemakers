import { render } from '@react-email/components';
import React from 'react';

import { AppPostFull } from '../shared/types/types.posts';
import { EmailTemplate } from './EmailTemplate';

export const renderEmail = (posts: AppPostFull[]) =>
  render(React.createElement(EmailTemplate, { posts: [] }));
