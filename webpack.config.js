const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './server.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    clean: true
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { 
                targets: { node: 'current' },
                modules: 'commonjs'
              }]
            ],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
  },
  optimization: {
    minimize: false
  }
};