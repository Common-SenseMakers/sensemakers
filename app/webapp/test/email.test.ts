// @ts-ignore
import { renderEmail } from '../build/bundle.js';
import { getMockPost } from '../src/mocks/posts.mock';

const root = document.getElementById('root');
const posts = [getMockPost()];
root ? (root.innerHTML = renderEmail(posts)) : null;
