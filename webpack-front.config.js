const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/front/index.ts",
  mode: 'development',
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
    filename: "bundle.js",
    path: path.resolve(__dirname, 'build/front')
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "static", to: "" },
      ],
    }),
  ],
}
