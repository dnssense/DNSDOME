const webpack = require('webpack');

// Using @angular-builder's custom-webpack
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      VERSION: (+new Date()).toString(),
    }),
  ],
};
