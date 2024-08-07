import fs from 'fs';

import {
  getMockAutoPublishedPost,
  getMockPendingPost,
  getMockPublishedPost,
} from '../../src/@shared/mocks/posts.mock';
import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { AppPostFull } from '../../src/@shared/types/types.posts';
import { RenderEmailFunction } from '../../src/@shared/types/types.user';

const { renderEmail } = require('../../src/@shared/emailRenderer') as {
  renderEmail: RenderEmailFunction;
};

describe('renders email', () => {
  it('imports the bundled render email function and successfully calls it', async () => {
    const posts: AppPostFull[] = [
      getMockAutoPublishedPost(),
      getMockAutoPublishedPost(),
      getMockAutoPublishedPost(),
      getMockAutoPublishedPost(),
      getMockPendingPost(),
      getMockPendingPost(),
      getMockPendingPost(),
      getMockPublishedPost(),
      getMockPublishedPost(),
      getMockPublishedPost(),
      getMockPublishedPost(),
      getMockPublishedPost(),
    ];
    const { html } = renderEmail(
      posts,
      NotificationFreq.Daily,
      'http://localhost:3000/'
    );
    fs.writeFileSync('test.email.html', html);
  });
});
