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

if (!process.env.FB_PROJECT) {
  throw new Error('FB_PROJECT is not set');
}

if (process.env.FB_PROJECT === 'production') {
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
            '"https://us-central1-cosmik-2ec25.cloudfunctions.net"',
          FB_APIKEY: '"AIzaSyDjzsOnkFkuaulkEFwhAf7u1GsWZu-CZks"',
          FB_AUTHDOMAIN: '"cosmik-2ec25.firebaseapp.com"',
          FB_PROJECTID: '"cosmik-2ec25"',
          FB_STORAGE_BUCKET: '"cosmik-2ec25.firebasestorage.app"',
          FB_MESSAGING_SENDER_ID: '"738519250701"',
          FB_APPID: '"1:738519250701:web:0ec9a3dd5efb29e3c46244"',
          APP_URL: '"https://app.cosmik.network"',
          IFRAMELY_API_URL: '"https://iframe.ly/api"',
          IFRAMELY_API_KEY: '"9b7970c7b5684e69e56692"',
          PUBLIC_POSTHOG_KEY:
            '"phc_xe0tTLhLRrP7zAjaml5NOdsbdUD9tHBzWDCy1IzSwFm"',
          PUBLIC_POSTHOG_HOST: '"https://app.cosmik.network/ingest"',
          PUBLIC_POSTHOG_UI_HOST: '"https://us.posthog.com"',
        },
      },
    }),
  ];
}

module.exports = base;
