const webpack = require('webpack');

const posthogConfig = process.env.POSTHOG ? {
  PUBLIC_POSTHOG_KEY:
    '"phc_xe0tTLhLRrP7zAjaml5NOdsbdUD9tHBzWDCy1IzSwFm"',
  PUBLIC_POSTHOG_HOST: '"http://localhost:8888/ingest"',
  PUBLIC_POSTHOG_UI_HOST: '"https://us.posthog.com"',
} : {};

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
              FB_PROJECTID: '"demo-sensenets"',
              PROJECT_TWITTER_ACCOUNT: '"CSensemakers"',
              APP_URL: '"http://localhost:3000"',
              IFRAMELY_API_URL: '"https://iframe.ly/api"',
              IFRAMELY_API_KEY: '"9b7970c7b5684e69e56692"',
              ...posthogConfig,
            },
          },
        }),
      ],
    },
  },
  plugins: [],
};
