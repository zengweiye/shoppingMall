const express = require('express');
var io = require('socket.io-client')
var socket = io.connect('http://localhost:3000', {reconnect: true});
const jwt = require('jsonwebtoken')
var router = express.Router();
const bcrypt = require('bcrypt')
var Admin = require('../model/admin');
var Good = require('../model/good');
var User = require('../model/user');
var Order = require('../model/order');
var Log = require('../model/log')
const { tokenKey, successCode, errorCode, emptyCode, permissionCode, emptyMessage, permissionMessage } = require('../config/config')
var verifyToken = require('../utils/verifyToken');

// websocket连接
socket.on('connect', function (socket) {
    console.log('Connected!');
});

// 增加管理员
/**
 * (Object: type)
 * name: string
 * password: string
 */
router.post('/addAdmin', async(req, res, next) => {
    await Admin.create({
        name: req.body.name,
        password: req.body.password
    })
    return res.send({
        status: successCode,
        message: "success"
    })
})

// 管理员登录
/**
 * 管理员只能通过账号登录
 * (Object: type)
 * name: string
 * password: string
 */
router.post('/adminLogin', async(req, res, next) => {
    let admin = await Admin.findOne({
        where: {
            name: req.body.name
        }
    })
    if(!admin){
        return res.send({
            status: errorCode,
            message: 'account is not existed'
        })
    }
    let compareResult = await bcrypt.compareSync(req.body.password, admin.password)
    if (compareResult){
        const token = 'Bearer '+jwt.sign({
            'id':admin.id,
            'name': admin.name,
            'isAdmin': 1
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
    return res.send({
        status: errorCode,
        message: "account or password is wrong"
    })
})

// 修改管理员密码
/**
 * (Object: type)
 * password: string
 * newPassword: string
 */
router.post('/updatePassword', async(req, res, next) => {
    let adminData = verifyToken(req.headers.authorization, res)
    let admin = await Admin.findOne({
        where: {
            id: adminData.id
        }
    })
    let compareResult = await bcrypt.compareSync(req.body.password, admin.password)
    if (compareResult) {
        admin.password = req.body.password
        admin.save()
        return res.send({
            status: successCode,
            message: 'success'
        })
    }
    return res.send({
        status: errorCode,
        message: "password is wrong"
    })
})

// 修改管理员信息
/**
 * (Object: type)
 * trueName: string
 * headPicture: string
 * phoneNumber: string
 * idCardNumber: string
 * idCardPicture: string
 */
router.post("/updateAdminMessage", async(req, res, next) => {
    let adminData = verifyToken(req.headers.authorization, res)
    let admin = await Admin.findOne({
        where: {
            id: adminData.id
        }
    })
    admin.trueName = req.body.trueName
    admin.headPicture = req.body.headPicture
    admin.phoneNumber = req.body.phoneNumber
    admin.idCardNumber = req.body.idCardNumber
    admin.idCardPicture = req.body.idCardPicture
    admin.save()
    return res.send({
        status: successCode,
        message: "success"
    })
})

// 修改用户信息
/**
 * (Object: type)
 * userId: integer
 * userName: string
 * trueName: string
 * headPicture: string
 * sex: integer
 * password: string
 * phoneNumber: string
 * email: string
 * address: string
 * isMerchant: integer
 * idCardPicture: string
 * idCardNumber: string
 */
router.post('/updateUserMessage', async(req, res, next) => {
    let adminData = verifyToken(req.headers.authorization, res)
    if (!adminData.isAdmin) {
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    }
    let user = await User.findOne({
        where: {
            id: req.body.userId
        }
    })
    // 保存修改前信息
    let beforeUpdate = {
        userName : user.userName,
        trueName: user.trueName,
        headPicture : user.headPicture,
        sex : user.sex,
        password : user.password,
        email : user.email,
        address : user.address,
        isMerchant : user.isMerchant,
        idCardPicture : user.idCardPicture,
        idCardNumber : user.idCardNumber
    }

    user.userName = req.body.userName
    user.trueName = req.body.trueName
    user.headPicture = req.body.headPicture
    user.sex = req.body.sex
    user.password = req.body.password
    user.email = req.body.email
    user.address = req.body.address
    user.isMerchant = req.body.isMerchant
    user.idCardPicture = req.body.idCardPicture
    user.idCardNumber = req.body.idCardNumber

    // 保存修改后信息
    let afterUpdate = {
        userName : user.userName,
        trueName: user.trueName,
        headPicture : user.headPicture,
        sex : user.sex,
        password : user.password,
        email : user.email,
        address : user.address,
        isMerchant : user.isMerchant,
        idCardPicture : user.idCardPicture,
        idCardNumber : user.idCardNumber
    }

    user.save()

    // 发送信息通知用户
    // 管理员id固定为10000
    let params = {
        senderName: 'admin',
        senderid: 10000,
        receiverName: req.body.userName,
        receiverId: req.body.userId,
        message: '用户信息已被管理员修改'
    }
    socket.emit('sendMessage', params)
    // 写入日志
    await Log.create({
        operatorId: adminData.id,
        operatorNmae: adminData.Name,
        operatorType: 0,
        beforeOperate: beforeUpdate,
        afterOperate: afterUpdate
    })

    return res.send({
        status: successCode,
        message: 'success'
    })
})

// 修改商品信息
/**
 * (Object: type)
 * merchantId: integer
 * merchantName: string
 * goodId: integer
 * goodName: string
 * goodAmount: integer
 * goodPictures: json
 * goodTag: string
 * goodPrice: integer
 * goodUnit: string
 * goodSellAmount: string
 * goodDetail: string
 */
router.post('/updateGoodMessage', async(req, res, next) => {
    let adminData = verifyToken(req.headers.authorization, res)
    if (!adminData.isAdmin) {
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    }
    let good = await Good.findOne({
        where: {
            id: req.body.goodId
        }
    })
    // 保存修改前信息
    let beforeUpdate = {
        goodName : good.goodName,
        goodAmount : good.goodAmount,
        goodPictures : good.goodPictures,
        goodTag : good.goodTag,
        goodPicture : good.goodPrice,
        goodUnit : good.goodUnit,
        goodSellAmount : good.goodSellAmount,
        goodDetail : good.goodDetail    
    }

    good.goodName = req.body.goodName
    good.goodAmount = req.body.goodAmount
    good.goodPictures = req.body.goodPictures
    good.goodTag = req.body.goodTag
    good.goodPrice = req.body.goodPrice
    good.goodUnit = req.body.goodUnit
    good.goodSellAmount = req.body.goodSellAmount
    good.goodDetail = req.body.goodDetail

    // 保存修改后信息
    let afterUpdate = {
        goodName : good.goodName,
        goodAmount : good.goodAmount,
        goodPictures : good.goodPictures,
        goodTag : good.goodTag,
        goodPicture : good.goodPrice,
        goodUnit : good.goodUnit,
        goodSellAmount : good.goodSellAmount,
        goodDetail : good.goodDetail    
    }
    good.save()

    // 发送信息通知用户
    // 管理员id固定为10000
    let params = {
        senderName: 'admin',
        senderid: 10000,
        receiverName: req.body.merchantName,
        receiverId: req.body.merchantId,
        message: '商品信息已被管理员修改'
    }
    socket.emit('sendMessage', params)
    // 写入日志
    await Log.create({
        operatorId: adminData.id,
        operatorNmae: adminData.Name,
        operatorType: 1,
        beforeOperate: beforeUpdate,
        afterOperate: afterUpdate
    })
    return res.send({
        status: successCode,
        message: 'success'
    })
})

// 修改订单状态
/**
 * (Object: type)
 * merchantId: integer
 * merchantName: string
 * userId: integer
 * userName: integer
 * orderId: integer
 * orderStatus: integer
 */
router.post('/updateOrderStatus', async(req, res, next) => {
    let adminData = verifyToken(req.headers.authorization, res)
    if (!adminData.isAdmin) {
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    }
    let order = await Order.findOne({
        where: {
            id: orderId
        }
    })
    // 修改前信息
    let beforeUpdate = {
        status : order.status    
    }

    order.status = req.body.OrderStatus

    // 修改后信息
    let afterUpdate = {
        status : order.status    
    }
    order.save()
    // 发送信息通知用户和商家
    // 管理员id固定为10000
    let paramsForMerchant = {
        senderName: 'admin',
        senderid: 10000,
        receiverName: req.body.merchantName,
        receiverId: req.body.merchantId,
        message: '订单状态已被管理员修改'
    }
    socket.emit('sendMessage', paramsForMerchant)
    let paramsForUser = {
        senderName: 'admin',
        senderid: 10000,
        receiverName: req.body.userName,
        receiverId: req.body.userId,
        message: '订单状态已被管理员修改'
    }
    socket.emit('sendMessage', paramsForUser)
    // 写入日志
    await Log.create({
        operatorId: adminData.id,
        operatorNmae: adminData.Name,
        operatorType: 2,
        beforeOperate: beforeUpdate,
        afterOperate: afterUpdate
    })
    return res.send({
        status: successCode,
        message: 'success'
    })
})

// 获取日志
/**
 * (Object: type)
 * type: integer
 * page: integer
 * tag: integer
 */
router.post('/getLog', async(req, res, next) => {
    let logs
    if (req.body.tag!==null) {
        logs = await Log.findAll({
            limit: 10,
            offset: 10*(req.body-1),
            where: {
                operatorType: req.body.tag
            }
        })
    }
    logs = await Log.findAll({
        limit: 10,
        offset: 10*(req.body-1),
    })
    return res.send({
        status: successCode,
        message: 'success',
        data: logs
    })
})

module.exports = router