import path from 'path';
import { fileURLToPath } from 'url';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  target: 'node',
  mode: 'production',
  entry: './server.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    module: true,
    libraryTarget: 'module',
  },
  experiments: {
    outputModule: true,
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
                modules: 'auto' 
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
    minimize: true
  }
};