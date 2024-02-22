module.exports = {
  require: ['ts-node/register', './src', 'src/__e2e_tests__/setup.ts'],
  exit: true,
  timeout: 1000000,
};
