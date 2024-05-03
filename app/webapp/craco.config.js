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
                '"http://127.0.0.1:5001/sensenets-staging/us-central1"',
              ORCID_CLIENT_ID: '"APP-M1QE4V5MBUYC7Y54"',
              TWITTER_CLIENT_ID: '"N0czb28xek5ldjRxdWpIRVVvZFg6MTpjaQ"',
              FB_APIKEY: '"AIzaSyBKsxHV-pLHsUKfSyKafyYlI2huHBogAz4"',
              FB_AUTHDOMAIN: '"sensenets-staging.firebaseapp.com"',
              FB_PROJECTID: '"sensenets-staging"',
              FB_STORAGE_BUCKET: '"sensenets-staging.appspot.com"',
              FB_MESSAGING_SENDER_ID: '"999821808505"',
              FB_APPID: '"1:999821808505:web:27c9f570bcd19f6e7755a8"',
            },
          },
        }),
      ],
    },
  },
  plugins: [],
};
