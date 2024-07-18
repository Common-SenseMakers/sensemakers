const webpack = require('webpack');

const getPlugins = (env) => [
  new webpack.DefinePlugin({
    process: {
      browser: true,
      env: {
        NODE_ENV: JSON.stringify(env.NODE_ENV || 'development'),
        FUNCTIONS_BASE: JSON.stringify(
          env.FUNCTIONS_BASE ||
            'http://127.0.0.1:5001/demo-sensenets/us-central1'
        ),
        ORCID_CLIENT_ID: JSON.stringify(
          env.ORCID_CLIENT_ID || 'APP-M1QE4V5MBUYC7Y54'
        ),
        TWITTER_CLIENT_ID: JSON.stringify(
          env.TWITTER_CLIENT_ID || 'N0czb28xek5ldjRxdWpIRVVvZFg6MTpjaQ'
        ),
        FB_PROJECTID: JSON.stringify(env.FB_PROJECTID || 'demo-sensenets'),
        PROJECT_TWITTER_ACCOUNT: JSON.stringify(
          env.PROJECT_TWITTER_ACCOUNT || 'rtk254'
        ),
        ...env,
      },
    },
  }),
];

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          alias: {
            ...webpackConfig.resolve.alias,
            'strip-ansi': require.resolve('strip-ansi-cjs'),
          },
        },
        plugins: [...webpackConfig.plugins, ...getPlugins(process.env)],
      };
    },
  },
};
