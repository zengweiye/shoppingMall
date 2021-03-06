const express = require('express');
var router = express.Router();
var History = require('../model/history')
const { successCode, errorCode, emptyCode, permissionCode, emptyMessage, permissionMessage } = require('../config/config')
var verifyToken = require('../utils/verifyToken');
const { Op } = require('sequelize/types');
const { result } = require('underscore');

// 获取历史记录
/**
 * (Object: type)
 * page: integer
 */

router.post('/geHistory', async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    let history = await History.findOne({
        raw: true,
        where: {
            userId: userData.id
        }
    })
    if (!history) {
        return res.send({
            status: emptyCode,
            message: emptyMessage
        })
    }
    let resultHistory = history.browseHistory.splice(page*10, 10)
    return res.send({
        status: successCode,
        message: 'success',
        data: resultHistory
    })
})

module.exports = router