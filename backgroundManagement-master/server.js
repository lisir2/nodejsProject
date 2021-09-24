// express 是nodejs 的框架 类似于 js原声 和 jq 的区别
const express = require('express');
const app = express();
const router = require('./router');
const bodyParser = require('body-parser');

// process.env.PORT 为vue运行环境 服务的端口号
const port = 5000;

// 配置post请求 获取参数
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//把路由挂在到 app服务中
app.use(router);

app.listen(port,()=>{
    console.log(`server runing on port`);
})

