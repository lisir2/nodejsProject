const express = require('express');
const Token = require('./token');
const router = express.Router();
const consumer = require('./mongoose').consumer;
const Profile = require('./mongoose').Profile;
// bcrypt对密码进行加密
const bcrypt = require('bcrypt');

// 校验token是否失效，响应不同内容
function isToken(token, res, callback) {
    if (token) {
        if (Token.verify(token).status) {
            callback()
        } else {
            res.status(401).json('token失效')
        }
    } else {
        res.status(401).json('缺失token')
    }
}

// 注册
router.post('/register', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var identity = req.body.identity;
    var name = req.body.name;
    
    consumer.findOne({ email: email }, (err, user) => {
        if (user) {
            res.status(400).json({
                msg: '账号已存在'
            })
        } else {
            var user = new consumer({
                email: email,
                passWord: password,
                identity: identity,
                name:name,
            })

            // 密码加密
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(user.passWord, salt, function (err, hash) {
                    console.log(err,hash)
                    // if (err) throw err;
                    user.passWord = hash;

                    user.save()
                        .then(user => {
                            res.json(user)
                        }
                            )
                        .catch(err => console.log(err))
                });
            });
        }
    })
})

// 登陆
router.post('/login', (req, res) => {
    var email = req.body.email;
    var passWord = req.body.passWord;
    console.log(email,passWord + 63)
    consumer.findOne({ email: email }, (err, user) => {
            console.log(user)
            if (!user) {
                return res.status(400).json({
                    msg: '账号错误'
                })
            }
            // 查询用户名返回用户数据, 把用户传的密码和数据库密码进行比较
            console.log(user)
            bcrypt.compare(passWord, user.passWord)
                .then(isMatch => {
                    if (isMatch) {
                        // 生成token
                        var token = Token.create({
                            email: user.email,
                            id: user.id,
                            name:user.name,
                            identity:user.identity
                        })

                        res.json({
                            msg: 'success',
                            email: user.email,
                            id: user.id,
                            token: token,
                            identity: user.identity,
                            avatar: user.avatar
                        })

                    } else {
                        return res.status(400).json({
                            msg: '密码错误'
                        })
                    }
                })
        })
})

// 增加接口信息
router.post('/Profile/add', (req, res) => {
    isToken(req.headers.token, res, function () {
        const profileFields = {};
        if (req.body.type) { profileFields.type = req.body.type; }
        if (req.body.describe) { profileFields.describe = req.body.describe; }
        if (req.body.income) { profileFields.income = req.body.income; }
        if (req.body.expend) { profileFields.expend = req.body.expend; }
        if (req.body.cash) { profileFields.cash = req.body.cash; }
        if (req.body.remark) { profileFields.remark = req.body.remark; }
        console.log(profileFields)

        new Profile(profileFields).save().then(Profile => {
            res.json(Profile)
        })
    })
})

// 获取所有信息
router.post('/Profile/all', (req, res) => {
    isToken(req.headers.token, res, function () {
        Profile.find()
            .then(result => {
                if (!result) {
                    return res.status(404).json('没有任何内容')
                } else {
                    res.json(result)
                }
            })
            .catch(err => {
                console.log(err)
            })
    });
})

// 获取单个信息
router.post('/Profile/one', (req, res) => {
    isToken(req.headers.token, res, function () {
        Profile.findOne({ id: req.body.id })
            .then(result => {
                res.json(result)
            })
            .catch(err => {
                console.log(err)
            })
    })
})

// 编辑单个信息
router.post('/Profile/edit', (req, res) => {
    isToken(req.headers.token, res, function () {
        const profileFields = {};
        if (req.body.type) { profileFields.type = req.body.type; }
        if (req.body.describe) { profileFields.describe = req.body.describe; }
        if (req.body.income) { profileFields.income = req.body.income; }
        if (req.body.expend) { profileFields.expend = req.body.expend; }
        if (req.body.cash) { profileFields.cash = req.body.cash; }
        if (req.body.remark) { profileFields.remark = req.body.remark; }

        Profile.findByIdAndUpdate(req.body.id,profileFields)
            .then(result => {
                res.json({msg:'修改成功'})
            })
            .catch(err => {
                res.json({msg:'修改失败'})
            })
    })
})

// 编辑单个信息
router.post('/Profile/del', (req, res) => {
    isToken(req.headers.token, res, function () {
        console.log(req.body.id)
        Profile.findByIdAndRemove(req.body.id)
            .then(result => {
                if(result){
                    res.json({msg:'删除成功'})
                }else{
                    res.status(404).json({msg:'查找不到'})
                }
                
            })
            .catch(err => {
                res.json({msg:'删除失败'})
            })
    })
})

module.exports = router;