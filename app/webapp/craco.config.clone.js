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
                '"http://127.0.0.1:5001/sensenets-prod/us-central1"',
              ORCID_CLIENT_ID: '"APP-M1QE4V5MBUYC7Y54"',
              FB_PROJECTID: '"sensenets-prod"',
              PROJECT_TWITTER_ACCOUNT: '"CSensemakers"',
              APP_URL: '"http://localhost:3000"',
              NANOPUB_EXPLORER_SERVER: '"https://np.test.knowledgepixels.com/"',
            },
          },
        }),
      ],
    },
  },
  plugins: [],
};
