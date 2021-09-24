const path = require('path')
const debug = process.env.NODE_ENV !== 'production'

module.exports = {
    baseUrl: '/', // 根域上下文目录
    outputDir: 'dist', // 构建输出目录
    assetsDir: 'assets', // 静态资源目录 (js, css, img, fonts)
    lintOnSave: false, // 是否开启eslint保存检测，有效值：ture | false | 'error'
    runtimeCompiler: true, // 运行时版本是否需要编译
    transpileDependencies: [], // 默认babel-loader忽略mode_modules，这里可增加例外的依赖包名
    productionSourceMap: true, // 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度
    parallel: require('os').cpus().length > 1, // 构建时开启多进程处理babel编译
    pluginOptions: { // 第三方插件配置
    },
    devServer: {
        open: true,
        host: '0.0.0.0',
        port: 8081,
        https: false,
        hotOnly: false,
        proxy: {//配置跨域
            '/api': {
                target: 'http://localhost:5000',//这里后台的地址模拟的;应该填写你们真实的后台接口
                ws: true,
                changOrigin: true,//允许跨域
                secure: false,
                pathRewrite: {
                    '^/api': ''//请求的时候使用这个api就可以
                }
            }
            
        },
        before: app => { }
    }
}
