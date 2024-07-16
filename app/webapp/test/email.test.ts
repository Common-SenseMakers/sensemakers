import React from 'react';
import ReactDOM from 'react-dom';

import { EmailTemplate } from '../src/email/EmailTemplate';
import { getMockPost } from '../src/mocks/posts.mock';

const pkg = require('../build/render-email.js');
const { renderEmail } = pkg;

const USE_BUNDLE = true;

const root = document.getElementById('root');

if (USE_BUNDLE) {
  root
    ? (root.innerHTML = renderEmail([
        getMockPost(),
        getMockPost(),
        getMockPost(),
      ]))
    : null;
} else {
  ReactDOM.render(
    React.createElement(EmailTemplate, {
      posts: [getMockPost(), getMockPost()],
    }),
    root
  );
}
