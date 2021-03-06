const express = require('express');
var router = express.Router();
var ShoppingCart = require('../model/shoppingCart')
var Good = require('../model/good')
const { successCode, errorCode, emptyCode } = require('../config/config')
var verifyToken = require('../utils/verifyToken');

// 获取购物车
// headers
router.post('/getShoppingCart', async(req, res, next) => {
    let user = verifyToken(req.headers.authorization, res)
    let shoppingCart = await ShoppingCart.findOne({
        where:{
            userId: user.id
        }
    })
    if(!shoppingCart){
        return res.send({
            status: emptyCode,
            message: '数据为空'
        })
    }
    return res.send({
        status: successCode,
        message: 'success',
        data: shoppingCart
    })
})

// 删除购物车商品
/*
*  (Object: type)
*  goods: JSON
*/
router.post('/deleteShoppingCart', async(req, res, next) => {
    let user = verifyToken(req.headers.authorization, res)
    let shoppingCart = await ShoppingCart.findOne({
        where: {
            userId: user.id
        }
    })
    if(!shoppingCart){
        return res.send({
            status: emptyCode,
            message: '数据为空'
        })
    } else {
        let tmp = JSON.parse(JSON.stringify(shoppingCart.goods))
        for (let i = 0; i < req.body.goods.length; i++){
            let j = 0
            while(tmp[j]){
                if(req.body.goods[i].goodId === tmp[j].goodId){
                    tmp.splice(j,1)
                } else {
                    j++
                }
            }
        }
        shoppingCart.goods = tmp
    }
    shoppingCart.save()
    return res.send({
        status: successCode,
        message: 'success',
        data: shoppingCart
    })
})

// 添加到购物车
/*
 *  (Object: type)
 *  good: {
 *     goodId,
 *     goodName,
 *     goodAmount
 * }
 */
router.post('/addToShoppingCart', async(req, res, next) => {
    let user = verifyToken(req.headers.authorization, res)
    let shoppingCart = await ShoppingCart.findOne({
        where:{
            userId: user.id
        }
    })
    let good = await Good.findOne({
        where: {
            id: req.body.good.goodId
        }
    })
    if (good.goodAmount < req.body.good.goodAmount) {
        return res.send({
            status: errorCode,
            message: '库存不足'
        })
    }
    if (!shoppingCart) {
        shoppingCart = await ShoppingCart.create({
            userId : user.id,
            goods : [req.body.good]
        })
    } else {
        let tmp = JSON.parse(JSON.stringify(shoppingCart.goods))
        tmp.push(req.body.good)
        shoppingCart.goods = tmp
    }
    shoppingCart.save()
    
    return res.send({
        status: successCode,
        message: 'success',
    })
})

module.exports = router