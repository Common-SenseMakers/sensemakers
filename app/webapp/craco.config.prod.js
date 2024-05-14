const base = require('./craco.config');
const webpack = require('webpack');
const orgPlugins = base.webpack.configure.plugins;

const ix = orgPlugins.findIndex((e) => {
  return e.definitions !== undefined;
});
const definePlugin = orgPlugins[ix];

/** remove original define plugin */
base.webpack.configure.plugins.splice(ix, 1);

/** new copy of plugins without the org define one */
const newPlugins = [...base.webpack.configure.plugins];

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV is not set');
}

if (process.env.NODE_ENV === 'staging') {
  base.webpack.configure.plugins = [
    ...newPlugins,
    new webpack.DefinePlugin({
      ...definePlugin.definitions,
      process: {
        ...definePlugin.definitions.process,
        env: {
          ...definePlugin.definitions.process.env,
          NODE_ENV: '"production"',
          FUNCTIONS_BASE:
            '"https://us-central1-sensenets-staging.cloudfunctions.net"',
          FB_APIKEY: '"AIzaSyBKsxHV-pLHsUKfSyKafyYlI2huHBogAz4"',
          FB_AUTHDOMAIN: '"sensenets-staging.firebaseapp.com"',
          FB_PROJECTID: '"sensenets-staging"',
          FB_STORAGE_BUCKET: '"sensenets-staging.appspot.com"',
          FB_MESSAGING_SENDER_ID: '"999821808505"',
          FB_APPID: '"1:999821808505:web:27c9f570bcd19f6e7755a8"',
        },
      },
    }),
  ];
}

if (process.env.NODE_ENV === 'production') {
  base.webpack.configure.plugins = [
    ...newPlugins,
    new webpack.DefinePlugin({
      ...definePlugin.definitions,
      process: {
        ...definePlugin.definitions.process,
        env: {
          ...definePlugin.definitions.process.env,
          NODE_ENV: '"production"',
          FUNCTIONS_BASE:
            '"https://us-central1-sensenets-prod.cloudfunctions.net"',
          FB_APIKEY: '"AIzaSyCEmcE2N789UbzcFUwxjsQeq3GR3CzFXnA"',
          FB_AUTHDOMAIN: '"sensenets-prod.firebaseapp.com"',
          FB_PROJECTID: '"sensenets-prod"',
          FB_STORAGE_BUCKET: '"sensenets-prod.appspot.com"',
          FB_MESSAGING_SENDER_ID: '"764998496280"',
          FB_APPID: '"1:764998496280:web:0f3d0515674eb53ca7936d"',
        },
      },
    }),
  ];
}

module.exports = base;
