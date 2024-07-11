const path = require('path');
const fs = require('fs');

module.exports = {
  webpack: {
    configure: (webpackConfig, { paths }) => {
      paths.appIndexJs = path.resolve(__dirname, 'src/email/index.ts');

      // Entry point configuration
      webpackConfig.entry = paths.appIndexJs;

      // Output configuration to produce a single JS bundle in the 'dist-module' directory
      webpackConfig.output = {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
        library: 'renderEmailModule',
        libraryTarget: 'umd',
        globalObject: 'this',
      };

      // Log paths for debugging
      console.log('Webpack entry:', webpackConfig.entry);
      console.log('Webpack output path:', webpackConfig.output.path);
      console.log('Webpack output filename:', webpackConfig.output.filename);

      //   Ensure output directory exists
      const outputDir = path.resolve(__dirname, 'build');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      return webpackConfig;
    },
  },
};
