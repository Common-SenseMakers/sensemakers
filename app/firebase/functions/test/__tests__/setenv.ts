import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'test') {
  throw new Error('dotenv used only on tests');
}

const result = dotenv.config({ path: '.env.test' });

if (result.error) {
  throw result.error;
}
