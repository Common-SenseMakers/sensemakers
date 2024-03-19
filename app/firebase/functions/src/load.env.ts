import * as dotenv from 'dotenv';

export function loadEnv() {
  const envFile = (() => {
    if (process.env.NODE_ENV === 'production') return '.env.production';
    if (process.env.NODE_ENV === 'test') return '.env.test';
    if (process.env.NODE_ENV === 'local') return '.env.local';
    return '.env';
  })();

  const result = dotenv.config({ path: envFile });

  if (result.error) {
    throw result.error;
  }
}
