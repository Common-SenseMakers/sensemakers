import { getMockPost } from '../src/mocks/posts.mock';

const renderEmail = require('../build/render-email.js').renderEmail;

const root = document.getElementById('root');
const posts = [getMockPost()];
root ? (root.innerHTML = renderEmail(posts)) : null;
