var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.join(__dirname, 'ts'),
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    "./app.tsx"
  ],
  output: {
    publicPath: '/build/',
    path: path.resolve("./build"),
    filename: "bundle.js"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      { test: /\.tsx?$/, loaders: ['react-hot', 'ts'] },
    ]
  },
  resolve: {
    modulesDirectories: [
      "node_modules"
    ],
    extensions: ["", ".tsx", ".ts", ".js"]
  },
  resolveLoader: {
    root: __dirname + "/node_modules"
  }
}