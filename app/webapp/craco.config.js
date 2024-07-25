const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {},
      },
      plugins: [
        new webpack.DefinePlugin({
          process: {
            browser: true,
            env: {
              NODE_ENV: '"development"',
              FUNCTIONS_BASE:
                '"http://127.0.0.1:5001/demo-sensenets/us-central1"',
              ORCID_CLIENT_ID: '"APP-M1QE4V5MBUYC7Y54"',
              TWITTER_CLIENT_ID: '"N0czb28xek5ldjRxdWpIRVVvZFg6MTpjaQ"',
              FB_PROJECTID: '"demo-sensenets"',
              PROJECT_TWITTER_ACCOUNT: '"rtk254"',
              APP_URL: '"http://localhost:3000"',
            },
          },
        }),
      ],
    },
  },
  plugins: [],
};
