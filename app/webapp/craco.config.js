const webpack = require('webpack');

const getPlugins = () => [
  new webpack.DefinePlugin({
    process: {
      browser: true,
      env: {
        NODE_ENV: '"development"',
        FUNCTIONS_BASE: '"http://127.0.0.1:5001/demo-sensenets/us-central1"',
        ORCID_CLIENT_ID: '"APP-M1QE4V5MBUYC7Y54"',
        TWITTER_CLIENT_ID: '"N0czb28xek5ldjRxdWpIRVVvZFg6MTpjaQ"',
        FB_PROJECTID: '"demo-sensenets"',
        PROJECT_TWITTER_ACCOUNT: '"rtk254"',
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
          },
        },
        plugins: [...webpackConfig.plugins, ...getPlugins(process.env)],
      };
    },
  },
};
