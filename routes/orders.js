const express = require('express');
var router = express.Router();
var Order = require('../model/order')
var Good = require('../model/good')
var RecommendByGood = require('../model/recommendByGood')
const { successCode, errorCode, emptyCode, emptymessage } = require('../config/config')
var verifyToken = require('../utils/verifyToken');

// 获取所有订单信息
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

// 新增订单
/**
 * (object: type)
 * goodId: integer
 * goodAmount: integer
 */
router.post('/addOrder', async(req, res, next) => {
    let user = verifyToken(req.headers.authorization, res)
    // 支付流程

    // 付款后逻辑
    // 减少商品存量，增加销量
    let good = await Good.findOne({
        where: {
            id: req.body.goodId
        }
    })
    good.goodAmount = good.goodAmount - req.body.goodAmount
    good.goodSellAmount = good.goodSellAmount + req.body.goodAmount
    good.save()

    // 获取所有订单数据，进行推荐算法分析并存储在数据库
    let orderGoods = await Order.findAll({
        where: {
            userId: user.id
        },
        Attributes:[
            'goodId'
        ],
        raw: true
    })
    if(orderGoods){
        let recommendByGood = await RecommendByGood.findOne({
            where: {
                goodId: req.body.goodId
            }
        })
        let relatedGoods = JSON.parse(JSON.stringify(recommendByGood.relatedGoods))
        for(let orderGood of orderGoods){
            for(let relatedGood of relatedGoods){
                if(relatedGood.goodId == orderGood){
                    relatedGood.timeNumber++
                }
            }
        }
        relatedGoods.sort((a,b) => {
            return b.timeNumber - a.timeNumber
        })
        relatedGoods.splice(0,100)
        recommendByGood.save()
    }
    return res.send({
        status: successCode,
        message: 'success'
    })
})

module.exports = router