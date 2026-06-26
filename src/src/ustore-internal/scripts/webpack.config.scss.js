const path = require("path");
const mime = require("mime-types");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ExtractCssVariablesPlugin = require("./extract-css-variables-plugin");
const devConfig = require("../../../dev.config");

module.exports = {
  mode: 'development',
  entry: "./src/index-wc.js", // Single entry point
  output: {
    path: path.resolve(__dirname, `../../../dist_for_wc`), // Output to "dist" directory
    pathinfo: true,
    filename: 'static/js/bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[name].[hash][ext]',
    publicPath: '/',
  },
  resolve: {
    alias: Object.entries(devConfig)
      .filter(([key, value]) => key.startsWith("$"))
      .reduce((r, [key, value]) => ({ ...r, [key]: value }), {}),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /public/],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"], // React support
            plugins: [require.resolve("react-refresh/babel")].filter(Boolean),
          },
        },
      },
      {
        test: /(assets\/icons\/.*\.svg)|(assets\/images\/new-upload\/.*\.svg)$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        issuer: /\.js$/,
        exclude: /node_modules/,
      },
      {
        test: /assets.*\.(png|gif|jpg|jpeg|svg)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: (file) => `[name].[ext]`,
            publicPath: `${devConfig.assetPrefix}/assets/images`
          }
        }],
        exclude: /bootstrap|static/
      },
      {
        test: /assets.*\.(eot|otf|woff|woff2|ttf)?$/,
        type: 'asset/inline',
        exclude: /bootstrap|static/
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
        ],
        include: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              sourceMap: false,
            },
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                loadPaths: devConfig.includeCssPaths, // Ensure this is correctly set
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/media/dev.css',
    }),
    new ExtractCssVariablesPlugin({
      cssFileName: 'static/media/dev.css',
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist_for_wc'),
      staticOptions: {
        setHeaders: (res, filePath) => {
          const type = mime.lookup(filePath);
          if (type) {
            res.setHeader("Content-Type", type);
          }
        },
      }
    },
    port: 3002,
    hot: true,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
};
