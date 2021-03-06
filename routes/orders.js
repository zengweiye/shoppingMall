const express = require('express');
var router = express.Router();
var Order = require('../model/order')
const { successCode, errorCode, emptyCode, emptymessage } = require('../config/config')
var verifyToken = require('../utils/verifyToken');

// 获取订单信息
router.post('/getOrder', async(req, res, next) => {
    let user = verifyToken(req.headers.authorization, res)
    let orders = await Order.findAll({
        where: {
            userId: user.id
        }
    })
    if(!orders){
        return res.send({
            status: emptyCode,
            message: emptymessage
        })
    }
    return res.send({
        status: successCode,
        message: 'success',
        data: orders
    })
})

// 修改订单
/* 
*  (Object: type)
*  orderId: integer
*  oldOrderStatus: integer
*/
router.post('/changeOrder', async(req, res, next) => {
    let user = verifyToken(req.headers.authorization, res)
    let order = Order.findOne({
        where: {
            id: req.body.orderId
        }
    })
    // 判断是否商家确认发货
    if( req.body.oldOrderStatus === order.orderStatus && order.orderStatus === 1){
        if( user.id === order.merchantId ){
            order.orderStatus++
            order.save()
            return res.send({
                code: successCode,
                message: 'success'
            })
        }
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    } else if(req.body.newOrderStatus < 4) { // 买家确认
        if( user.id === order.userId ){
            order.orderStatus++
            order.save()
            return res.send({
                code: successCode,
                message: 'success'
            })
        }
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    }
})

// 取消订单
// 发送信息到卖家

module.exports = router