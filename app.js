//app.js入门模块
//职责：
//	创建服务
//	做一些服务相关配置
//	模板引擎
//	body-parser 解析表单post请求体
//	提供静态服务
//	挂在路由
//	监听端口号启动服务

var express = require('express');
var router = require('./router');
var bodyParser = require('body-parser');
var fs = require('fs');
//引入websocket服务
var Websocket = require('./wsServer');

//引入第三方模块 express-session  我的理解：服务端的cookie
var session = require('express-session');

var app = express();

// 使用 session 中间件   服务端保存用户登录的状态
app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
//  cookie : {
//      maxAge : 1000 * 10, // 设置 session 的有效时间，单位毫秒
//  },
}));
//配置模板引擎和body-parser 一定要在app.use(router)挂在之前
app.engine('html', require('express-art-template'));

//公开静态资源
app.use('/public/', express.static('./public'));
app.use('/node_modules/', express.static('./node_modules'));

//配置解析post请求体   limit 设置请求体的大小
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
//parse application/jsjon
app.use(bodyParser.json({limit:'50mb'}));

//把路由挂在到 app服务中
app.use(router);

app.listen(3000, function() {
	console.log('服务器启动成功');
})