const express = require('express');
var router = express.Router();
var Good = require('../model/good')
var History = require('../model/history')
var User = require('../model/user');
var RecommendByGood = require('../model/recommendByGood')

const { tokenKey, successCode, errorCode, emptyCode, permissionCode, emptyMessage, permissionMessage } = require('../config/config')
var verifyToken = require('../utils/verifyToken');

const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const good = require('../model/good');

// 添加商品
/*
*  (Object: type)
*  goodName: string
*  goodAmount: integer
*  goodPics: json
*  goodType: string
*  goodPrice: integer
*  goodUnit: string
*  goodDetail: string
*/
router.post('/addGood',async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    await Good.create({
        merchantId: userData.id,
        merchantName: userData.accountName,
        goodName: req.body.goodName,
        goodAmount: req.body.goodAmount,
        goodPics: req.body.goodPics,
        goodTag: req.body.goodTag,
        goodPrice: req.body.goodPrice,
        goodUnit: req.body.goodUnit,
        goodDetail: req.body.goodDetail
    })
    res.send({
        status: successCode,
        message: 'success'
    })
})

// 修改商品
/*
*  (Object: type)
*  goodName: string
*  goodAmount: integer
*  goodPics: json
*  goodType: string
*  goodPrice: integer
*  goodUnit: string
*  goodDetail: string
*/
router.post('/changeGood', async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    let good = await Good.findOne({
        where: {
            id: req.body.goodId
        }
    })
    if(!good){
        return res.send({
            status: emptyCode,
            message: emptyMessage
        })
    }
    if (good.merchantId != userData.id) {
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    } else {
        good.goodName = req.body.goodName,
        good.goodAmount = req.body.goodAmount,
        good.goodPics = req.body.goodPics,
        good.goodTag = req.body.goodTag,
        good.goodPrice = req.body.goodPrice,
        good.goodUnit = req.body.goodUnit,
        good.goodDetail = req.body.goodDetail
        good.save()
    }
    res.send({
        status:successCode,
        message: 'success'
    })
})

// 删除商品
/*
*  (Object: type)
*  goodId: integer
*/
router.post('/deleteGood',async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    let good = await Good.findOne({
        where: {
            id: req.body.goodId
        }
    })
    if( good.merchantId != userData.id ) {
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    }
    await Good.destroy({
        where: {
            id: req.body.goodId
        }
    })
    res.send({
        status: successCode,
        message: 'delete successfully'
    })
})

// 获取商品
router.post('/getGood', async(req, res, next) => {
    let user
    if(!req.headers.authorization){
        user = undefined
    }else {
        let token = req.headers.authorization.split(' ').pop()
        jwt.verify(token,tokenKey, (err,result) => {
            if(err) {
                res.send({
                    status: errorCode,
                    message: '用户登录过期，请登录'
                })
                res.end()
            } else {
                user = result
            }
        })
    }

    let good = await Good.findOne({
        raw: true,
        where: {
            id: req.body.goodId
        }
    })
    if(!good){
        return res.send({
            status: emptyCode,
            message: emptyMessage
        })
    }

    if(user){
        let userHistory = await History.findOne({
            where: {
                userId: user.id
            }
        })
        if(!userHistory){
            userHistory = await History.create({
              userId: user.id,
              browseHistory: [{
                'merchantId': good.merchantId,
                'merchantName': good.merchantName,
                'goodId': good.id,
                'goodName': good.goodName,
                'goodPic': good.goodPics[1]
            }],
              browseHistoryTag: [good.goodTag]
            })
            
        } else {
            let history = JSON.parse(JSON.stringify(userHistory.browseHistory))
            if(!history){
                history = []
            }
            
            let obj = {
                merchantId: good.merchantId,
                merchantName: good.merchantName,
                goodId: good.id,
                goodName: good.goodName,
                goodPic: good.goodPics[1]
            }
            for(let i = 0; i < history.length; i++){
                if(history[i].goodId === obj.goodId){
                    history.splice(i,1)
                    break
                }
            }
            history.unshift(obj)
            
            userHistory.browseHistory = history

            let tag = JSON.parse(JSON.stringify(userHistory.browseHistoryTag))
            if(tag.indexOf(good.goodTag)!=-1){
                let tmpTag = tag.splice(tag.indexOf(good.goodTag), 1)
                tag.unshift(tmpTag[0])
            } else {
                tag.unshift(good.goodTag)
            }
            userHistory.browseHistoryTag = tag
        }
        userHistory.save()
    }

    return res.send({
        status: successCode,
        message: 'success',
        data: good
    })
})

// 查找店家
/*
*  (Object: type)
*  merchantName: string
*/
router.post('/findMerchantGoods', async(req, res, next) => {
    let merchantName = await User.findOne({
        where: {
            accountName: req.body.merchantName
        }
    })
    if (!merchantName){
        return res.send('merchant is not existed')
    }
    let goods = await Good.findAll({
        where: {
            merchantName: req.body.merchantName
        }
    })
    res.send({
        status:successCode,
        message: 'success',
        data: {
            merchantName: merchantName,
            goods: goods
        }
    })
})

// 模糊搜索
/**
 * (Object: type)
 * goodName: string
 * page: integer
 */
router.post('/findGoods', async(req, res, next) => {
    let goods = await Good.findAll({
        raw: true,
        order: [
            ['goodName','DESC']
        ],
        where: {
            goodName: {
                [Op.like]: '%'+ req.body.goodName + '%'
            }
        }
    })
    if(!goods){
        return res.send({
            status:emptyCode,
            message:emptyMessage
        })
    }
    let resultGoods = goods.splice((res.body.page-1)*10, 10)
    return res.send({
        status: successCode,
        message: 'success',
        data: resultGoods
    })
})

// 根据商品标签推荐
/**
 * (Object: type)
 * goodId: integer
 * page: integer
 */
router.post('/getRecommendByGoodTag', async (req, res, next) => {
    let good = await Good.findOne({
        raw: true,
        where: {
            id: req.body.goodId
        }
    })
    let goodTag = good.goodTag
    let recommendGoods = await Good.findAll({
        raw: true,
        where: {
            goodTag: goodTag
        },
        order: [
            ['goodSellAmount','DESC']
        ]
    })
    if (!recommendGoods) {
        return res.send({
            status: emptyCode,
            message: emptyMessage
        })
    }
    // 传出最高10个
    let resultGoods = resultGoods = recommendGoods.splice(0*req.body.page, 10)

    return res.send({
        status: successCode,
        message: 'success',
        data: resultGoods
    })
})

// 根据用户浏览历史推荐
/**
 * (object: type)
 * page: integer
 */
router.post('/getRecommendByHistory', async( req, res, next ) => {
    let userData = verifyToken(req.headers.authorization, res)
    let history = await History.findOne({
        where: {
            userId: userData.id
        }
    })
    let goods = await Good.findAll({
        where: {
            goodTag: {[Op.in]: history.browseHistoryTag}
        },
        order:[
            ['goodSellAmount','DESC']
        ]
    })
    let result = goods.splice(0*req.body.page, 10)

    return res.send({
        status: successCode,
        message: 'success',
        data: result
    })

})

// 协同过滤推荐
/**
 * (object: type)
 * goodId: integer
 */
router.post('/getRecommendByGood', async(req, res, next) => {
    let recommendByGood = await RecommendByGood.findOne({
        where: {
            goodId: req.body.goodId
        }
    })
    let result = recommendByGood.relatedGoods.splice(0,10)
    return res.send({
        status: successCode,
        message: 'success',
        data: result
    })
})

module.exports = router