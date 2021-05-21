const path = require('path');

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
    resolve: {
      alias: {
        'src': resolve('./src')
      }
    },
    // externals: {
    //   'vue': 'Vue',
    //   'element-ui': 'ELEMENT',
    // },
    devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : 'none',
  },
};

