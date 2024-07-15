import { AppPostFull } from '../../src/@shared/types/types.posts';

const pkg = require('../../src/static/render-email.js');

const { renderEmail } = pkg;

describe.only('renders email', () => {
  it('imports the bundled render email function and successfully calls it', async () => {
    const posts: AppPostFull[] = [];
    const html = renderEmail(posts);
    console.log(html);
  });
});
