const base = require('./craco.config');
const webpack = require('webpack');

// Access the plugins directly
const { plugins } = base;
const ix = plugins.findIndex((e) => e.definitions !== undefined);
const definePlugin = plugins[ix];

// Remove original define plugin
plugins.splice(ix, 1);

const projectSpecificEnv = (() => {
  if (process.env.FB_PROJECT === 'dev') {
    return {
      FUNCTIONS_BASE: '"https://us-central1-sensenets-dev.cloudfunctions.net"',
      FB_APIKEY: '"AIzaSyDTGlezOv68B6_sZHbUZP8xrvKgCaO614c"',
      FB_AUTHDOMAIN: '"sensenets-dev.firebaseapp.com"',
      FB_PROJECTID: '"sensenets-dev"',
      FB_STORAGE_BUCKET: '"sensenets-dev.appspot.com"',
      FB_MESSAGING_SENDER_ID: '"943634188972"',
      FB_APPID: '"1:943634188972:web:7c68eb87a4e517af63ad09"',
      APP_BUILD: true,
    };
  }

  if (process.env.FB_PROJECT === 'staging') {
    return {
      FUNCTIONS_BASE:
        '"https://us-central1-sensenets-staging.cloudfunctions.net"',
      FB_APIKEY: '"AIzaSyBKsxHV-pLHsUKfSyKafyYlI2huHBogAz4"',
      FB_AUTHDOMAIN: '"sensenets-staging.firebaseapp.com"',
      FB_PROJECTID: '"sensenets-staging"',
      FB_STORAGE_BUCKET: '"sensenets-staging.appspot.com"',
      FB_MESSAGING_SENDER_ID: '"999821808505"',
      FB_APPID: '"1:999821808505:web:27c9f570bcd19f6e7755a8"',
    };
  }

  if (process.env.FB_PROJECT === 'production') {
    return {
      FUNCTIONS_BASE: '"https://us-central1-sensenets-prod.cloudfunctions.net"',
      FB_APIKEY: '"AIzaSyCEmcE2N789UbzcFUwxjsQeq3GR3CzFXnA"',
      FB_AUTHDOMAIN: '"sensenets-prod.firebaseapp.com"',
      FB_PROJECTID: '"sensenets-prod"',
      FB_STORAGE_BUCKET: '"sensenets-prod.appspot.com"',
      FB_MESSAGING_SENDER_ID: '"764998496280"',
      FB_APPID: '"1:764998496280:web:0f3d0515674eb53ca7936d"',
    };
  }
})();

// Define new plugins array with modified configuration

// Setup development-specific plugins
plugins.push(
  new webpack.DefinePlugin({
    ...definePlugin.definitions,
    process: {
      ...definePlugin.definitions.process,
      env: {
        ...definePlugin.definitions.process.env,
        NODE_ENV: '"development"',
        ...projectSpecificEnv,
      },
    },
  })
);

// Repeat the above if-block for staging and production with their respective settings

module.exports = base;
