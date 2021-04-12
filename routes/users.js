const bcrypt = require('bcrypt')
const express = require('express');
const jwt = require('jsonwebtoken')
var router = express.Router();
var User = require('../model/user')
var RegisterCode = require('../model/registerCode')
var nodemailer = require('../utils/nodemailer')
var randomCode = require('../utils/randomCode')
var {tokenKey, successCode, errorCode} = require('../config/config');
const verifyToken = require('../utils/verifyToken');

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  // console.log('get!')
  // User.findAll({
  //   attributes: ['name', 'password']
  // }).then(function(message){
  //   console.log(JSON.stringify(message))
  //   res.send(JSON.stringify(message))
  // })
});

// 注册
/*
*  (Object: type)
*  email: sting
*  userName: string
*  password: string
*  phoneNumber: string
*  code: string
*/
router.post('/register',async (req, res, next)=>{
  let isEmailExist
  let isNameExist
  let isPhoneExist
  // 验证邮箱是否存在
  await User.findOne({
    where:{
      email: req.body.email
    }
  })
  .then(result => {
    isEmailExist = result
  })
  // 验证手机是否存在
  await User.findOne({
    where:{
      phoneNumber: req.body.phoneNumber
    }
  })
  .then(result => {
    isPhoneExist = result
  })
  // 验证账号名是否存在
  await User.findOne({
    where: {
      userName: req.body.userName
    }
  })
  .then(result => {
    isNameExist = result
  })
  if (isEmailExist) {
    return res.send({
      status: errorCode,
      message: "email is existed"
    })
  } else if (isNameExist) {
    return res.send({
      status: errorCode,
      message: "name is existed"
    })
  } else if (isPhoneExist) {
    return res.send({
      status: errorCode,
      message: "phoneNumber is existed"
    })
  } else {
    // 查找验证码
    let registerCode = await RegisterCode.findOne({
      where: {
        email:req.body.email
      }
    })
    if(registerCode.code === req.body.code){
      let user = await User.create({
        userName: req.body.userName,
        password: req.body.password,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber
      })
      return res.send({
        status: successCode,
        message: 'success',
      })
    } else {
      return res.send({
        status: errorCode,
        message: "wrong code"
      })
    }
  }
})

// 登录
// 验证码登录或者密码登录，验证码登录时密码为空，密码登录时验证码为空
/**
 *  (Object: type)
 *  email: sting || null
 *  userName: string || null
 *  password: string || null
 *  code: string || null
*/
router.post('/login', async(req, res, next) => {
  let user
  // 判断用户是否存在
  if (req.body.email){
    user = await User.findOne({
      where:{
        email: req.body.email
      }
    })
  } else if(req.body.userName){
    user = await User.findOne({
      where:{
        account: req.body.userName
      }
    })
  }
  if(!user){
    return res.send({
      status: errorCode,
      message: 'account is not existed'
    })
  }
  // 验证码登录
  if (req.body.code) {
    if(user.code == req.body.code){
      // 设置token
      const token = 'Bearer '+jwt.sign({
        'id':user.id,
        'userName':user.userName
      },
      tokenKey,
      {
        expiresIn: 3600*24
      })
      return res.send({
        status: successCode,
        message: 'success',
        token: token
      })
    }
    else {
      return res.send({
        status: errorCode,
        message: 'wrong code'
      })
    }
  }
  // 密码登录
  let compareResult = await bcrypt.compareSync(req.body.password, user.password)
  // token设置
  if (compareResult){
    const token = 'Bearer '+jwt.sign({
      'id':user.id,
      'userName':user.userName,
      'isMerchant': user.isMerchant
    },
    tokenKey,
    {
      expiresIn: 3600*24
    })
    return res.send({
      status: successCode,
      message: 'success',
      token: token
    })
  }else{
    return res.send({
      status: errorCode,
      message: 'account or password is wrong'
    })
  }
})

// 发送注册验证码
/*
*  (Object: type)
*  email: string
*/
router.post('/registerCode',async(req, res, next) => {
  let code = randomCode()
  let registerCode = await RegisterCode.findOne({
    where: {
      email: req.body.email
    }
  })
  if(registerCode){
    registerCode.code = code
    registerCode.save()
  } else {
    await RegisterCode.create({
      email: req.body.email,
      code: code
    }).then(result => {
      registerCode = result
    })
  }
  let mail = {
    from: 'yezi6735@163.com',
    to: req.body.email,
    cc: 'yezi6735@163.com',
    subject: '这是你在商城请求的验证码',
    text: `使用${code}作为你的验证码`
  }
  await nodemailer(mail)
  res.send({
    status: successCode,
    message: 'success',
  })
})

// 发送登录/修改验证码
/*
*  (Object: type)
*  email: string
*/
router.post('/verificationCode',async(req, res, next) => {
  let code = randomCode()
  await User.update({code: code},{
    where: {
      email:req.body.email
    }
  })
  let mail = {
    from: 'yezi6735@163.com',
    to: req.body.email,
    subject: '验证码',
    text: `用${code}作为你的验证码`
  }
  await nodemailer(mail)
  res.send({
    status: successCode,
    message: 'success'
  })
})

// 修改密码
/*
 * (Object: type)
 * email: string
 * code: integer
 * or
 * userName: string
 * password: string
 * newPassword: string
 */
router.post('/updatePassword',async(req, res, next) => {
  let user
  if(req.body.email){
    user = await User.findOne({
      where:{
        email: req.body.email
      }
    })
  } else if (req.body.userName) {
    user = await User.findOne({
      where: {
        userName: req.body.userName
      }
    })
  }
  if(!user){
    return res.send({
      status: errorCode,
      message: 'account is not existed'
    })
  }
  // 通过验证码修改
  if(req.body.code){
    if(user.code === req.body.code){
      user.password = req.body.newPassword
      await user.save()
      return res.send({
        status: successCode,
        message: "password has changed"
      })
    } else {
      return res.send({
        status: errorCode,
        message: "wrong code"
      })
    }
  }
  // 通过密码修改
  let compareResult = await bcrypt.compareSync(req.body.password, user.password)
    if(compareResult){
      user.password = req.body.newPassword
      user.save()
      return res.send({
        status: successCode,
        message: 'success'
      })
    } else {
      return res.send({
        status: errorCode,
        message: 'wrong password'
      })
    }
})

// 获取信息
router.post('/getUserMessage', async(req, res, next) => {
  let userData = verifyToken(req.headers.authorization, res)
  let user = await User.findOne({
    raw: true,
    where: {
      id: userData.id
    },
    attributes: [
      'id',
      'userName',
      'headPic',
      'phoneNumber',
      'email',
      'address',
      'isMerchant'
    ]
  })
  return res.send({
    status: successCode,
    status: 'success',
    data: user
  })
})

// 修改信息
/**
 * (Object: type)
 * headPic: string
 * address: json
 */
router.post('/updateMessage', async(req, res, next) => {
  let userData = verifyToken(req.headers.authorization, res)
  let user = await User.findOne({
    where: {
      id: userData.id
    }
  })
  user.headPic = req.body.headPic
  user.address = req.body.address
  user.save()
  return res.send({
    status: successCode,
    message: 'success'
  })
})

// 修改手机
/**
 * (Object: type)
 * phoneNumber: string
 * code: integer
 */
router.post('/updatePhoneNumber', async (req, res, next) => {
  let userData = verifyToken(req.headers.authorization, res)
  let user = await User.findOne({
    where: {
      id: userData.id
    }
  })
  if(req.body.code === user.code) {
    user.phoneNumber = req.body.phoneNumber
  } else {
    return res.send({
      status: errorCode,
      message: "验证码错误"
    })
  }
  user.save()
  return res.send({
    status: successCode,
    message: 'success',
  })
})

// 修改邮箱
/**
 * (Object: type)
 * email: string
 * code: integer
 */
router.post('/updateEmail', async (req, res, next) => {
  let userData = verifyToken(req.headers.authorization, res)
  let user = await User.findOne({
    where: {
      id: userData.id
    }
  })
  if(req.body.code === user.code) {
    user.email = req.body.email
  } else {
    return res.send({
      status: errorCode,
      message: "验证码错误"
    })
  }
  user.save()
  return res.send({
    status: successCode,
    message: 'success',
  })
})

module.exports = router;
