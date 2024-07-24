const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { paths }) => {
      paths.appIndexJs = path.resolve(__dirname, 'src/index.lib.ts');

      // Entry point configuration
      webpackConfig.entry = paths.appIndexJs;

      webpackConfig.mode = 'development';
      webpackConfig.optimization.minimize = false;
      webpackConfig.optimization.splitChunks = {
        cacheGroups: {
          default: false,
        },
      };
      webpackConfig.optimization.runtimeChunk = false;
      webpackConfig.devtool = 'source-map';


      // Output configuration to produce a single JS bundle in the 'dist-module' directory
      webpackConfig.output = {
        ...webpackConfig.output,
        filename: 'index.js',
        path: path.resolve(__dirname, 'build'),
        library: 'renderEmailModule',
        libraryTarget: 'umd',
        globalObject: 'this',
      };

      // Define 'window' as undefined for Node.js environment
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          window: {
            location: {},
          },
        })
      );

      webpackConfig.module.rules.push({
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: true,
                noEmit: false,
                emitDeclarationOnly: true,
              },
            },
          },
        ],
        exclude: /node_modules/,
      });

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
  babel: {
    loaderOptions: {
      presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
      plugins: [],
      // Disable compact mode
      compact: false,
    },
  }
};
