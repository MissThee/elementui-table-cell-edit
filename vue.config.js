const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

function resolve(dir) {
  //此处使用path.resolve 或path.join 可自行调整
  return path.join(__dirname, dir);
}

module.exports = {
  // 打包文件输出路径，即打包到哪里
  outputDir: 'dist',
  // 静态资源地址
  assetsDir: 'static',
  // eslint-loader 是否在保存的时候检查
  lintOnSave: false,
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: true,
  runtimeCompiler: true,
  filenameHashing: true, //文件hash
  css: {
    extract: false,
    sourceMap: true, // 开启 CSS source maps
  },
  publicPath: './',
  configureWebpack: {
    plugins: [
      new UglifyJsPlugin({
        uglifyOptions: {
          // warnings: false,//见https://www.webpackjs.com/plugins/uglifyjs-webpack-plugin/
          compress: {
            drop_console: process.env.NODE_ENV === 'production', //console //见https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
            drop_debugger: process.env.NODE_ENV === 'production',
            pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log'] : []
          }
        }
      })
    ],
    resolve: {
      alias: {
        'src': resolve('./src')
      }
    },
    externals: {
      'vue': 'Vue',
      'element-ui': 'ELEMENT',
    },
    devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : 'none',
  },
};

