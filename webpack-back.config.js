const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: "node",
  mode: "production",
  entry: {
    app: ["./src/back/server.ts"]
  },
  output: {
    path: path.resolve(__dirname, "./build/back"),
    filename: "bundle.js"
  },
  externals: [nodeExternals()],
}
