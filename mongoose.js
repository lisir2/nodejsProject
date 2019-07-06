var mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

//1.连接数据库
mongoose.connect('mongodb://localhost/users');

mongoose.connection.on('open',function(){
	console.log('数据库连接成功')
})

mongoose.connection.on('error',function(){
	if(err){
		console.log('数据库连接失败')
	}
})

//2.设计文档结构（表结构）
//字段名称就是表结构中的属性名称
//约束的目的就是为了保证数据的完整性，不要有脏数据


var userSchema = new mongoose.Schema({
	zhanghao:{
		type:String,
		required:true
	},
	Password:{
		type:Number,
		required:true
	},
	headPic:{
		type:String,
		default:'./public/image/bizhi10.jpg'
	},
	userName:{
		type:String,
		default:'最好的我们'
	}
})

var commentSchema = new mongoose.Schema({
	userId:{
		type:String,
		required:true,
	},
	blogsContent:{
		type:String,
		required:true,
	},
	blogsTitle:{
		type:String,
		required:true,
	},
	commentList:{
		type:Object,
		default:[]
	},
	headPic:{
		type:String,
		default:''
	},
	Date:{
		type:String,
		default:new Date().getTime()
	}
})

var chatSchema = new mongoose.Schema({
	headPic:{
		type:String,
		required:true,
	},
	data:{
		type:String,
		required:true,
	},
	userName:{
		type:String,
		required:true,
	},
	userId:{
		type:String,
		required:true,
	},
	Date:{
		type:String,
		default:new Date().getTime()
	}
})

//如果结构需要添加数据可以使用add
//commentSchema.add( { author: String, body: String} );

//3.将文档结构发布与模型

//	mongoose.model  方法就是用来将一个架构发布为model
//	第一个参数 ： 传入一个大写名词单数字字符串用来表示你的数据库名称
//		mongoose 会自动将大写名词的字符串生成小写复数 的集合名称
//		例如这里的User 最终会变成users集合名称
//	第二个参数:架构  Schema

//	返回值:模型构造函数
module.exports = {
	Users:mongoose.model('users',userSchema),
	Comments:mongoose.model('Comments',commentSchema),
	chatMessage:mongoose.model('chatMessage',chatSchema)
}
