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

if (process.env.FB_PROJECT === 'dev') {
  base.webpack.configure.plugins = [
    ...newPlugins,
    new webpack.DefinePlugin({
      ...definePlugin.definitions,
      process: {
        ...definePlugin.definitions.process,
        env: {
          ...definePlugin.definitions.process.env,
          NODE_ENV: '"development"',
          FUNCTIONS_BASE:
            '"https://us-central1-sensenets-dev.cloudfunctions.net"',
          FB_APIKEY: '"AIzaSyDTGlezOv68B6_sZHbUZP8xrvKgCaO614c"',
          FB_AUTHDOMAIN: '"sensenets-dev.firebaseapp.com"',
          FB_PROJECTID: '"sensenets-dev"',
          FB_STORAGE_BUCKET: '"sensenets-dev.appspot.com"',
          FB_MESSAGING_SENDER_ID: '"943634188972"',
          FB_APPID: '"1:943634188972:web:7c68eb87a4e517af63ad09"',
          APP_URL: '"https://development--sensemakers.netlify.app/"',
          IFRAMELY_API_URL: '"https://iframe.ly/api"',
          IFRAMELY_API_KEY: '"9b7970c7b5684e69e56692"',
          PUBLIC_POSTHOG_KEY:
            '"phc_xe0tTLhLRrP7zAjaml5NOdsbdUD9tHBzWDCy1IzSwFm"',
          PUBLIC_POSTHOG_HOST: '"https://development--sensemakers.netlify.app/ingest"',
          PUBLIC_POSTHOG_UI_HOST: '"https://us.posthog.com"',
        },
      },
    }),
  ];
}

if (process.env.FB_PROJECT === 'clusters') {
  base.webpack.configure.plugins = [
    ...newPlugins,
    new webpack.DefinePlugin({
      ...definePlugin.definitions,
      process: {
        ...definePlugin.definitions.process,
        env: {
          ...definePlugin.definitions.process.env,
          NODE_ENV: '"development"',
          FUNCTIONS_BASE:
            '"https://us-central1-sensenets-clusters.cloudfunctions.net"',
          FB_APIKEY: '"AIzaSyAKLtiyLuT2AmWdTmYCpEOzu_FvWXz-qN4"',
          FB_AUTHDOMAIN: '"sensenets-dev2.firebaseapp.com"',
          FB_PROJECTID: '"sensenets-dev2"',
          FB_STORAGE_BUCKET: '"sensenets-dev2.firebasestorage.app"',
          FB_MESSAGING_SENDER_ID: '"418506613529"',
          FB_APPID: '"1:418506613529:web:aa3e658ac737a28a585b88"',
          APP_URL: '"https://development--sensemakers.netlify.app/"',
          IFRAMELY_API_URL: '"https://iframe.ly/api"',
          IFRAMELY_API_KEY: '"9b7970c7b5684e69e56692"',
          PUBLIC_POSTHOG_KEY:
            '"phc_xe0tTLhLRrP7zAjaml5NOdsbdUD9tHBzWDCy1IzSwFm"',
          PUBLIC_POSTHOG_HOST: '"https://us.i.posthog.com"',
        },
      },
    }),
  ];
}

if (process.env.FB_PROJECT === 'staging') {
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
          APP_URL: '"https://staging--sensemakers.netlify.app/"',
          IFRAMELY_API_URL: '"https://iframe.ly/api"',
          IFRAMELY_API_KEY: '"9b7970c7b5684e69e56692"',
        },
      },
    }),
  ];
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
            '"https://us-central1-sensenets-prod.cloudfunctions.net"',
          FB_APIKEY: '"AIzaSyCEmcE2N789UbzcFUwxjsQeq3GR3CzFXnA"',
          FB_AUTHDOMAIN: '"sensenets-prod.firebaseapp.com"',
          FB_PROJECTID: '"sensenets-prod"',
          FB_STORAGE_BUCKET: '"sensenets-prod.appspot.com"',
          FB_MESSAGING_SENDER_ID: '"764998496280"',
          FB_APPID: '"1:764998496280:web:0f3d0515674eb53ca7936d"',
          APP_URL: '"https://app.sense-nets.xyz/"',
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
