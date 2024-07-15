import { renderEmail } from '../src/email';
import { getMockPost } from '../src/mocks/posts.mock';

const root = document.getElementById('root');
root ? (root.innerHTML = renderEmail([getMockPost()])) : null;
