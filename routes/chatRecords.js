const express = require('express');
var router = express.Router();
var ChatRecord = require('../model/chatRecord')
const { successCode, errorCode, emptyCode } = require('../config/config')
var verifyToken = require('../utils/verifyToken');

// 获取记录
router.post('/getChatRecords', async(req, res, next) => {
    let user = verifyToken(req.headers.authorization, res)
    let chatRecords = await ChatRecord.findOne({
        where: {
            userId: user.id
        }
    })
    return res.send({
        status: successCode,
        message: 'success',
        data: chatRecords
    })
})