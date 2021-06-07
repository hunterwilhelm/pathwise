const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: "node",
  mode: "development",
  entry: {
    app: ["./src/back/sketch.app.ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: [path.resolve(__dirname, 'src')]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, "./build/"),
    filename: "bundle.js"
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
}
