const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app/javascripts/app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" },
      { from: './app/assets/daslogo.png', to: "daslogo.png" },
      { from: './app/assets/logo.png', to: "logo.png" },
      { from: './app/assets/cryptotimer-logo.svg', to: "cryptotimer-logo.svg" },
      { from: './app/assets/bg.png', to: "bg.png" },
      { from: './app/assets/metamask.png', to: "metamask.png" },
      { from: './app/assets/random-avatar-1.png', to: "avatar1.png" },
      { from: './app/assets/chainlink.png', to: "chainlink.png" }
    ])
  ],
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  }
}
