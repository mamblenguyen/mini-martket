const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  target: 'node',
  externals: [nodeExternals({ allowlist: ['webpack/hot/poll?100'] })],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
