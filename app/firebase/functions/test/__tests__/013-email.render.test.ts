import fs from 'fs';

import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { AppPostFull } from '../../src/@shared/types/types.posts';
import {
  AutopostOption,
  RenderEmailFunction,
} from '../../src/@shared/types/types.user';
import { getMockPostNew } from '../utils/posts.utils';

const { renderEmail } = require('../../src/@shared/emailRenderer') as {
  renderEmail: RenderEmailFunction;
};

describe('renders email', () => {
  it('imports the bundled render email function and successfully calls it', async () => {
    const posts: AppPostFull[] = [
      getMockPostNew(),
      getMockPostNew(),
      getMockPostNew(),
      getMockPostNew(),
      getMockPostNew(),
      getMockPostNew(),
    ];
    const { html } = renderEmail(
      posts,
      NotificationFreq.Daily,
      AutopostOption.MANUAL,
      'http://localhost:3000'
    );
    // save html to txt file
    fs.writeFileSync('email.html', html);
    console.log(html);
  });
});
