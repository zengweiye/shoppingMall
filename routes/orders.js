const express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
var Order = require('../model/order')
var Good = require('../model/good')
var RecommendByGood = require('../model/recommendByGood')
const { successCode, errorCode, emptyCode, emptymessage, permissionCode, permissionMessage } = require('../config/config')
var verifyToken = require('../utils/verifyToken');
var io = require('socket.io-client')
var socket = io.connect('http://localhost:3000', {reconnect: true});

// websocket连接
socket.on('connect', function (socket) {
    console.log('Connected!');
});

// 获取所有订单信息
router.post('/getOrder', async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    let orders = await Order.findAll({
        where: {
            userId: userData.id
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

// 修改订单状态
/* 
*  (Object: type)
*  orderId: integer
*  oldOrderStatus: integer
*/
router.post('/updateOrder', async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    let order = await Order.findOne({
        where: {
            id: req.body.orderId
        }
    })
    // 判断是否商家确认发货
    if( req.body.oldOrderStatus === order.orderStatus && order.orderStatus === 1){
        if( userData.id === order.merchantId ){
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
        if( userData.id === order.userId ){
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

// 新增订单
/**
 * (object:type)
 * goods: [
 *      {
 *          goodId,
 *          goodAmount,
 *          merchantId
 *      }
 * ]
 * address
 */
router.post('/createOrder',async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    console.log(userData)
    let goods = req.body.goods
    console.log(goods)
    let orderIdList = []
    for (let item of goods) {
        // 减少商品存量，增加销量
        let good = await Good.findOne({
            where: {
                id: item.goodId
            }
        })
        if (good.goodAmount < item.goodAmount) {
            return res.send({
                status: errorCode,
                message: '库存不足'
            })
        }
        console.log(typeof good.goodAmount,typeof good.goodSellAmount)
        console.log(item, typeof item.goodAmount, item.goodAmount)
        good.goodAmount = good.goodAmount - item.goodAmount
        good.goodSellAmount = good.goodSellAmount + item.goodAmount
        console.log(good.goodAmount, good.goodSellAmount)
        // 新增订单
        await Order.create({
            userId: userData.id,
            userName: userData.userName,
            goodName: good.goodName,
            goodId: good.id,
            goodAmount: item.goodAmount,
            merchantId:item.merchantId,
            merchantName: good.merchantName,
            goodPrice: good.goodPrice,
            orderPrice: item.goodAmount*good.goodPrice,
            status: 0 // 未支付
        }).then( result => {
            orderIdList.push(result.id)
        })
        good.save()
        // 发送信息通知用户和商家
        // 管理员id固定为10000
        let paramsForMerchant = {
            senderName: 'admin',
            senderid: 10000,
            receiverName: good.merchantName,
            receiverId: good.merchantId,
            message: `你的商品${good.goodName}有新的订单，请留意订单列表`
        }
        socket.emit('sendMessage', paramsForMerchant)
        let paramsForUser = {
            senderName: 'admin',
            senderid: 10000,
            receiverName: userData.userName,
            receiverId: userData.id,
            message: `你购买的商品${good.goodName}已下单，请留意订单列表`
        }
        socket.emit('sendMessage', paramsForUser)
    }

    

    return res.send({
        status: successCode,
        message: 'success',
        data: {
            orderIdList
        }
    })
})

// 支付订单
/**
 * (object: type)
 * orderId: integer
 */
router.post('/payOrder', async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    // 更改订单状态为已支付
    let order = await Order.findOne({
        where: {
            id: req.body.orderId
        }
    })
    order.status = 1
    order.save()
    // 获取所有订单数据，根据推荐算法分析并存储在数据库
    let orderGoods = await Order.findAll({
        where: {
            userId: userData.id,
            status: {
                [Op.between]: [1,4]
            }
        }
    })
    console.log(orderGoods)
    // 查询商品标签
    let good = await Good.findOne({
        where: {
            id: order.goodId
        }
    })
    // 将以前订单的物品推荐中进行添加新的物品以及次数
    if(orderGoods){
        // 添加物品以及次数到推荐表中
        for (let orderGood of orderGoods) {
            // 除去物品自身
            if (orderGood.goodId != order.goodId) {
                // 查询是否存在推荐表中
                let recommendByGood = await RecommendByGood.findOne({
                    where: {
                        goodId: orderGood.goodId
                    }
                })
                
                // 如果不存在则创建
                if (!recommendByGood) {
                    await RecommendByGood.create({
                        goodId: orderGood.goodId,
                        relatedGoods: [
                            {
                                goodId: order.goodId,
                                timeNumber: 1
                            }
                        ],
                        relatedGoodTags: [
                            {
                                goodTag: good.goodTag,
                                timeNumber: 1
                            }
                        ]
                    })
                } else {
                    // 存在记录则遍历记录查询是否存在次数
                    let relatedGoods = JSON.parse(JSON.stringify(recommendByGood.relatedGoods))
                    let relatedGoodTags = JSON.parse(JSON.stringify(recommendByGood.relatedGoodTags))
                    let goodRepeatFlag = false
                    let tagRepeatFlag = false
                    for (let relatedGood of relatedGoods) {
                        if(relatedGood.goodId == order.goodId) {
                            relatedGood.timeNumber++
                            goodRepeatFlag = true
                            break
                        }
                    }
                    if (goodRepeatFlag){
                        relatedGoods.push([
                            {
                                goodId: order.goodId,
                                timeNumber: 1
                            }
                        ])
                    }
                    for (let relatedGoodTag of relatedGoodTags) {
                        if(relatedGoodTag.tag == good.goodTag) {
                            relatedGood.timeNumber++
                            tagRepeatFlag = true
                            break
                        }
                    }
                    if(tagRepeatFlag){
                        relatedGoodTags.push([
                            {
                                tag: good.goodTag,
                                timeNumber: 1
                            }
                        ])
                    }
                    recommendByGood.relatedGoods = relatedGoods
                    recommendByGood.relatedGoodTags = relatedGoodTags
                    recommendByGood.save()
                }
            }
        }
    }
    return res.send({
        status: successCode,
        message: 'success'
    })
})

module.exports = router