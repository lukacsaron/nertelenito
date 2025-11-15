const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background/background.ts',
    popup: './src/popup/popup.ts',
    options: './src/options/options.ts',
    contentFacebook: './src/content/contentFacebook.ts',
    'redirect-overlay': './src/redirect-overlay.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/popup/popup.css', to: 'popup.css' },
        { from: 'src/options/options.html', to: 'options.html' },
        { from: 'src/options/options.css', to: 'options.css' },
        { from: 'src/content/contentFacebook.css', to: 'contentFacebook.css' },
        { from: 'src/redirect-overlay.html', to: 'redirect-overlay.html' },
        { from: 'src/redirect-overlay.css', to: 'redirect-overlay.css' },
        { from: 'src/help.html', to: 'help.html' },
        { from: 'icons', to: 'icons', noErrorOnMissing: true }
      ]
    })
  ],
  devtool: false
};