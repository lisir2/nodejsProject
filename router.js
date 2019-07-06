var fs = require('fs');
var express = require('express');
var Users = require('./mongoose').Users;
var Comment = require('./mongoose').Comments;
var chatMessage = require('./mongoose').chatMessage;

var path = require('path');
//formidable处理POST方式提交的表单数据
var formidable = require('formidable')

//express 提供了更好的方式
//专门用来包装路由的
var router = express.Router();

//通过id查询用户
function findId(id, callback) {
	Users.findOne({
		_id: id
	}, function(err, ret) {
		if(err) {
			console.log('查询失败')
		} else if(ret != '') {
			callback(ret)
		}
	})
}

//获取当前登陆用户的个人信息
router.post('/userMessage',function(req,res){
	if(req.session.userId) {
		findId(req.session.userId, function(ret) {
			res.send(ret)
		})
	} else {
		res.redirect('login')
	}
})

//登陆页面 pc登陆页面
router.get('/login', function(req, res) {
	res.render('login.html')
})

//登陆页面  移动登陆页面
router.get('/R_login', function(req, res) {
	res.render('R_login.html')
})

//注册页面
router.get('/register', function(req, res) {
	res.render('register.html')
})

//注册页面
router.get('/R_register', function(req, res) {
	res.render('R_register.html')
})

//在线聊天页面
router.get('/chat',function(req,res){
	if(req.session.userId) {
		findId(req.session.userId, function(ret) {
			res.render('chat.html', {
				ret: ret
			})
		})
	} else {
		res.redirect('login')
	}
})

//发起登陆
router.post('/login', function(req, res) {
	var zhanghao = req.body.zhanghao;
	var Password = req.body.Password;

	Users.findOne({
		zhanghao: zhanghao
	}, function(err, ret) {
		console.log('err:' + err + ',ret:' + ret)
		console.log(ret == '')
		if(err) {
			console.log('查询失败')
		} else if(ret == '' || ret == null) {
			res.send({
				"error": true,
				"message": "账号错误"
			})
		} else {
			Users.findOne({
				zhanghao: zhanghao,
				Password: Password
			}, function(err, ret) {
				if(err) {
					console.log('查询失败')
				} else if(ret == '' || ret == null) {
					res.send({
						"error": true,
						"message": "密码错误"
					})
				} else {
					console.log(ret)
					//设置响应头，下次请求的时候请求头会携带cookie   cookie为设置的Set-Cookie  ret[0].id
					//					res.setHeader('Set-Cookie',ret[0].id);
					req.session.userId = ret.id;
					res.send({
						"error": false,
						"message": "登陆成功",
						"content": ret
					})
				}
			})
		}
	})
})

//发起注册
router.post('/register', function(req, res) {
	var zhanghao = req.body.zhanghao;
	Users.findOne({
		zhanghao: zhanghao
	}, function(err, ret) {
		if(err) {
			console.log('查询失败')
		} else if(ret == '' || ret == null) {
			new Users(req.body).save(function(err, result) {
				if(err) {
					console.log('保存失败')
				} else {
					res.send({
						"error": false,
						"message": "注册成功",
						"content": result
					})
				}
			})
		} else {
			res.send({
				"error": true,
				"message": "账号存在"
			})
		}
	})
})

//登陆成功页面
router.get('/home', function(req, res) {
	if(req.session.userId) {
		findId(req.session.userId, function(ret) {
			res.render('home.html', {
				ret: ret
			})
		})
	} else {
		res.redirect('login')
	}
})

//查询聊天记录
router.post('/chatMessage',function(req,res){
	if(req.session.userId) {
		chatMessage.find({},function(err,result){
			if(err){
				res.send({
					'error':true,
					'message':'查询失败',
				})
			}else{
				res.send({
					'error':false,
					'message':'查询成功',
					'content':result
				})
			}
		})
	}else{
		res.redirect('login')
	}
})

//编辑个人信息
router.get('/edit', function(req, res) {
	if(req.session.userId) {
		findId(req.session.userId, function(ret) {
			res.render('edit.html', {
				ret: ret
			})
		})
	} else {
		res.redirect('login')
	}
})

//博客页面
router.get('/blogs', function(req, res) {
	if(req.session.userId) {
		findId(req.session.userId, function(ret) {
			res.render('blogs.html', {
				ret: ret
			})
		})
	} else {
		res.redirect('login')
	}
})

//博客详细信息查询
router.post('/blogsContent', function(req, res) {
	var id = req.body.id;
	Comment.findOne({
		_id: id
	}, function(err, result) {
		if(err || result == null) {
			res.send({
				"error": true,
				"message": "查询失败"
			})
		} else {
			console.log(result.userId)
			findId(result.userId, function(ret) {
				console.log(ret)
				res.send({
					"error": false,
					"message": "查询成功",
					"content": result,
					"userName": ret.userName
				})
			})

		}
	})
})

//发起博客评论
router.post('/userComment', function(req, res) {
	if(req.session.userId) {
		//评论内容
		var content = req.body.content;
		//博客id
		var commentId = req.body.commentId;
		//查询是否有这个博客
		Comment.findOne({
			_id: commentId,
		}, function(err, result) {
			if(err || result == null) {
				res.send({
					"error": true,
					"message": "查询失败"
				})
			} else {
				//传content参数，为评论
				if(content) {
					//获取评论用户的信息
					var addComment = {
						userId: req.session.userId,
						content: content,
						Date: (new Date()).getTime()
					};
					result.commentList.push(addComment)
					Comment.findOneAndUpdate({
						_id: commentId
					}, {
						commentList: result.commentList
					}, function(err, result) {
						if(err) {
							res.send({
								"error": true,
								"message": "评论失败"
							})
						} else {
							var sendComment = addComment;
							console.log(sendComment)
							findId(sendComment.userId, function(ret) {
								sendComment.userName = ret.userName;
								sendComment.headPic = ret.headPic;

								console.log(sendComment)
								res.send({
									"error": false,
									"message": "评论成功",
									"content": sendComment
								})
							})
						}
					})
					//不传content参数为，获取评论
				} else {
					var Comments = result;
					for(let i = 0; i < Comments.commentList.length; i++) {
						findId(Comments.commentList[i].userId, function(ret) {
							Comments.commentList[i].userName = ret.userName;
							Comments.commentList[i].headPic = ret.headPic;
							if(i == Comments.commentList.length - 1) {
								res.send({
									"error": false,
									"message": "评论成功",
									"content": Comments
								})
							}
						})
					}
				}

			}
		})

	} else {
		res.redirect('login')
	}
})

//修改密码接口
router.post('/editPassword',function(req,res){
	if(req.session.userId){
		var oldPassword = req.body.oldPassword;
		var newPassword = req.body.newPassword;
		console.log(oldPassword,newPassword)
		Users.findOne({
			_id:req.session.userId
		},function(err,ret){
			if(err){
				res.send({
					'error':true,
					'message':'服务器错误'
				})
			}else{
				if(ret.Password == oldPassword){
					Users.update({
						_id:req.session.userId
					},{
						Password:newPassword
					},function(err,ret){
						if(err){
							res.send({
								'error':true,
								'message':'服务器错误'
							})
						}else{
							res.send({
								'error':false,
								'message':'修改成功',
								'content':ret
							})
						}
					})	
				}else{
					res.send({
						'error':true,
						'message':'密码错误'
					})
				}
				
			}
		})
	}else{
		res.redirect('login')
	}
})

//发起博客
router.post('/blogs', function(req, res) {
	if(req.session.userId) {
		findId(req.session.userId, function(ret) {
			new Comment({
				userId: req.session.userId,
				blogsContent: req.body.content,
				blogsTitle: req.body.title,
				headPic: ret.headPic,
				Date: (new Date()).getTime()
			}).save(function(err, result) {
				if(err) {
					console.log(err)
					res.send({
						"error": true,
						"message": "发送失败"
					})
				} else {
					console.log(result)
					res.send({
						"error": false,
						"message": "发送成功",
						"content": result
					})
				}
			})
		})
	} else {
		res.redirect('login')
	}
})

//博客详情页面
router.get('/blogsMessage', function(req, res) {
	if(req.session.userId) {
		findId(req.session.userId, function(ret) {
			res.render('blogsMessage.html', {
				ret: ret
			})
		})
	} else {
		res.redirect('login')
	}
})

//最新博客排序封装
function newBlogs(callback) {
	Comment.find({}, null, {
		sort: {
			Date: -1
		}
	}, function(err, result) {
		if(err) {
			callback({
				"error": true,
				"message": "服务器错误"
			})
		} else {
			callback({
				"error": false,
				"message": "排序成功",
				"content": result
			})
		}
	})
}

//最火博客排序封装
function Bestseller(callback) {
	Comment.find({}, function(err, result) {
		if(err) {
			callback({
				"error": true,
				"message": "服务器错误"
			})
		} else {
			var comments = result;
			var Sort;
			for(var i = 0; i < comments.length - 1; i++) {
				for(var j = 0; j < comments.length - i - 1; j++) {
					if(comments[j].commentList.length < comments[j + 1].commentList.length) {
						Sort = comments[j];
						comments[j] = comments[j + 1];
						comments[j + 1] = Sort;
					}
				}
			}
			callback({
				"error": false,
				"message": "排序成功",
				"content": comments
			})
		}
	})
}

//最新博客
router.post('/Bestseller', function(req, res) {
	if(req.session.userId) {
		Bestseller(function(result) {
			res.send(result);
		})
	} else {
		res.redirect('login')
	}
})

//最新博客
router.post('/newBlogs', function(req, res) {
	if(req.session.userId) {
		newBlogs(function(result) {
			res.send(result);
		})
	} else {
		res.redirect('login')
	}
})

//修改用户昵称
router.post('/editName', function(req, res) {
	if(req.session.userId) {
		var newName = req.body.newName;
		Users.findByIdAndUpdate(req.session.userId, {
			userName: newName
		}, function(err, result) {
			if(err) {
				res.send({
					'error': true,
					'message': '修改失败'
				})
			} else {
				res.send({
					'error': false,
					'message': '修改成功',
					'userName': newName
				})
			}
		})

	} else {
		res.redirect('login');
	}
})

//修改头像
router.post('/upHead', function(req, res) {
	if(req.session.userId) {
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			//parse 两个参数,第一个参数为req是前台传过来的信息 第二个参数为回调函数,回调函数有三个参数,第一个参数为错误信息,第二个参数为前台传过来的文字信息,第三个参数为前台传过来的文件信息
			if(err || fields.pic == '') {
				res.send({
					'message': '上传失败',
					'error': true,
				})
			} else {
				console.log(fields);
				//临时存储路径，files.pic.path
				console.log(files.pic.path);
				//上传的文件的文件名
				console.log(files.pic.name);
				//判断是否存在image文件夹
				fs.exists('./public/image', function(bol) {
					if(!bol) {
						fs.mkdir('./public/image', function(err) {
							if(err) {
								console.log('创建未遂');
							} else {
								console.log('创建成功');
							}
						});
					}
				});
				//创建可读流读取文件
				var rs = fs.createReadStream(files.pic.path);
				//创建可写流写文件
				var ws = fs.createWriteStream('./public/image/' + files.pic.name);

				rs.pipe(ws);

				var headPicPath = path.join('./public/image', files.pic.name);

				findId(req.session.userId, function(ret) {
					Users.findByIdAndUpdate(ret._id, {
						headPic: headPicPath
					}, function(err, ret) {
						if(err) {
							console.log('更新失败')
						} else {
							Comment.update({
								userId: ret._id
							}, {
								headPic: headPicPath
							}, function(err, ret) {
								if(err) {
									console.log('更新失败')
								} else {
									console.log(ret)
									res.send({
										'imagePath': headPicPath,
										'message': '上传成功',
										'error': false,
									})
								}
							})
						}
					})

				})
			}
		})
	} else {
		res.redirect('login')
	}

})

//退出登录
router.get('/out', function(req, res) {
	if(req.session.userId) {
		req.session.userId = null;
		res.redirect('login');
	}
})
module.exports = router;