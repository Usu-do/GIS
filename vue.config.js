module.exports = {
    // 关键配置：设置正确的公共路径
    publicPath: process.env.NODE_ENV === 'production' 
      ? '/GIS/'  // 替换为你的实际仓库名
      : '/',
    
    // 可选：配置构建输出目录
    outputDir: 'dist',
    
    // 可选：确保静态资源路径正确
    assetsDir: 'static',
    
    // 可选：生产环境不生成 source map 以减小文件大小
    productionSourceMap: false
  }