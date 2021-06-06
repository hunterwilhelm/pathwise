const path = require('path');

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
  }
}
