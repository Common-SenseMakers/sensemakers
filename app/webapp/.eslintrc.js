module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json', // Ensure this points to the correct path for your tsconfig file
    tsconfigRootDir: __dirname, // Optional, ensures ESLint resolves relative paths correctly
    ecmaVersion: 2020, // Optional, allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  plugins: ['@typescript-eslint'],

  extends: [
    'react-app',
    'react-app/jest',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'no-useless-escape': 'error',
    "@typescript-eslint/no-empty-interface": "off",
    eqeqeq: ['error', 'always'],
    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        ignoreVoid: false, // Ensure that `void` is required for unawaited async functions
      },
    ],
  },
};
