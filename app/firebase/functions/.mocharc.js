module.exports = {
  require: [
    'ts-node/register',
    './test/__tests__/setup.ts',
    './test/__tests__/index.test.ts',
  ],
  exit: true,
  timeout: 1000000,
};
