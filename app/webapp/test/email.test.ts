import { renderEmail } from '../src/email';

const root = document.getElementById('root');
root ? (root.innerHTML = renderEmail([])) : null;
