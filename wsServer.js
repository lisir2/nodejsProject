//引入数据库
var chatMessage = require('./mongoose').chatMessage;
var WebSocket = require("ws")

let wss = new WebSocket.Server({port:5000});

//当客户端连接WebSocket的时候触发的一个事件   原声的websocket就两个常用的方法on('message)  send()    
let clientsArr = [];
wss.on('connection',function(ws){   //ws可以监听客户端的消息
	console.log('连接成功');
    //每一个用户连接就会创建一个ws，全部放到一个数组里面
    clientsArr.push(ws);
    //当websocket连接成功之后把数据返回给前端
    //监听客户端发送的消息
    ws.on('message',function(data){  //前端发送过来的是个数组  data是个数组
    	//返回客户端  发送前台 只能发送字符串
        clientsArr.forEach(w=>{
            w.send(JSON.stringify({data:JSON.parse(data)}));
        })
        
        var message = JSON.parse(data)
        message.userId = message._id;
    	delete message._id;
    	console.log(message + '            23')
    	new chatMessage(message).save(function(err,result){
    		if(err){
    			console.log('保存失败' + message)
    		}else{
    			console.log('保存成功')
    			chatMessage.find({},function(err,res){
		    		console.log(res)
		    	})
    		}
    	})
    	
    	
        
    })
    //当某个ws断开连接 就删除掉
    ws.on('close',function(){
        clientArr = clientsArr.filter(client=>client!=ws);
    })
})