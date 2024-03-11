import * as dotenv from 'dotenv';

export function loadEnv() {
  const envFile =
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : process.env.NODE_ENV === 'test'
        ? '.env.test'
        : '.env';

  const result = dotenv.config({ path: envFile });

  if (result.error) {
    throw result.error;
  }
}
