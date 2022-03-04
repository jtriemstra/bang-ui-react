const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

module.exports = env => {
  console.log(env.APP_ENV);
  return {
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader"
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: "./src/index.html",
        filename: "./index.html"
      })
      ,
      new CopyWebpackPlugin([ { from: 'src/images', to: 'images' }, { from: 'src/styles', to: 'styles'} ])
      ,
      new webpack.DefinePlugin({'process.env':{APP_ENV:JSON.stringify(env.APP_ENV)}})
    ],
    devServer: {
      port:8001
    },
    optimization:{
      minimize:false
    }
  }
};