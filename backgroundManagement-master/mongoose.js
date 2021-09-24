const mongoose = require('mongoose');

// connect to mongodb
mongoose.connect("mongodb://localhost/users")
    .then(()=>{
        console.log('mongodb connect success')
    }).catch(err => {
        console.log('连接失败')
    })


var consumerSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
    },
    passWord:{
        type:String,
        require:true,
    },
    date:{
        type:Date,
        default:Date.now
    },
    identity:{
        type:String,
        require:true,
    },
    avatar:{
        type:String
    }
})

var ProfileSchema = new mongoose.Schema({
    type:{
        type:String,
    },
    describe:{
        type:String,
        require:true,
    },
    income:{
        type:String,
        require:true,
    },
    expend:{
        type:String,
        require:true,
    },
    cash:{
        type:String,
        require:true,
    },
    remark:{
        type:String,
        require:true,
    },
    date:{
        type:Date,
        default:Date.now
    }
})

//	返回值:模型构造函数
module.exports = {
    consumer:mongoose.model('consumer',consumerSchema),
    Profile:mongoose.model('Profile',ProfileSchema)
}