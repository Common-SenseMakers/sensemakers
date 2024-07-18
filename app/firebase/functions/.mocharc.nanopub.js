module.exports = {
  require: [
    'ts-node/register',
    './test/__tests__/setenv.ts',
    './test/__tests__/setup.empty.ts',
    './test/__tests__/index.test.ts',
  ],
  exit: true,
  timeout: 1000000,
};
