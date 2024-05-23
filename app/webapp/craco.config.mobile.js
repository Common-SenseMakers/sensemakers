const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();
const hostIp = process.env.HOST_IP;
if (!hostIp) {
  throw new Error('HOST_IP is not set in .env file');
}

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
                `"http://${hostIp}:5001/demo-sensenets/us-central1"`,
              ORCID_CLIENT_ID: '"APP-M1QE4V5MBUYC7Y54"',
              TWITTER_CLIENT_ID: '"N0czb28xek5ldjRxdWpIRVVvZFg6MTpjaQ"',
              FB_PROJECTID: '"demo-sensenets"',
              PROJECT_TWITTER_ACCOUNT: '"rtk254"',
            },
          },
        }),
      ],
    },
  },
  plugins: [],
};
