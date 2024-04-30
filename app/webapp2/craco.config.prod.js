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
          '"https://us-central1-sensenets-9ef26.cloudfunctions.net"',
      },
    },
  }),
];

module.exports = base;
