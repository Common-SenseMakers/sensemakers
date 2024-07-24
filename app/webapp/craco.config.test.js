const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { paths }) => {
      paths.appHtml = path.resolve(__dirname, 'test/email.template.html');
      paths.appIndexJs = path.resolve(__dirname, 'test/email.test.ts');
      webpackConfig.entry = paths.appIndexJs;
      webpackConfig.plugins.forEach((plugin) => {
        if (plugin.constructor.name === 'HtmlWebpackPlugin') {
          plugin.options.template = paths.appHtml;
        }
      });
      return webpackConfig;
    },
  },
};
