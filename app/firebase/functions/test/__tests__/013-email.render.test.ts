import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { AppPostFull } from '../../src/@shared/types/types.posts';
import { AutopostOption, PLATFORM } from '../../src/@shared/types/types.user';
import { getMockPost } from '../utils/posts.utils';

const { renderEmail } = require('../../src/@shared/emailRenderer');

describe.only('renders email', () => {
  it('imports the bundled render email function and successfully calls it', async () => {
    const posts: AppPostFull[] = [
      getMockPost({
        generic: {
          thread: [{ content: 'test content 1' }],
          author: {
            id: '123456',
            name: 'test author',
            platformId: PLATFORM.Twitter,
            username: 'test_author',
          },
        },
      }),
    ];
    const { html } = renderEmail(
      posts,
      NotificationFreq.Daily,
      AutopostOption.MANUAL
    );
    console.log(html);
  });
});
