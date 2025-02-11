const webpack = require('webpack');
const base = require('./craco.config');

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
              ...base.localEnv,
              FUNCTIONS_BASE:
                '"http://127.0.0.1:5001/sensenets-prod/us-central1"',
              FB_PROJECTID: '"sensenets-prod"',
            },
          },
        }),
      ],
    },
  },
  plugins: [],
};
