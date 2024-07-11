import { renderEmail } from 'webapp/src/email';

import { getMockPost } from '../utils/posts.utils';

describe.only('email.render', () => {
  it('renders email template', async () => {
    const post = getMockPost({});
    const email = renderEmail([post]);

    console.log('email: ', email);
  });
});
