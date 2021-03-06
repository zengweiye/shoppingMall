const express = require('express');
var router = express.Router();
var Comment = require('../model/comment')
const { Op } = require("sequelize")
const { successCode, errorCode, emptyCode, permissionCode, emptyMessage, permissionMessage } = require('../config/config')
var verifyToken = require('../utils/verifyToken');
var { buildTree } = require('../utils/buildTree');

// 添加评论
/*
*  (Object: type)
*  goodId: integer
*  commentContent: string
*  commentPics: json
*  parentId: integer
*  parentKey: string
*/
router.post('/addComment', async (req, res, next) => {
    let user = verifyToken(req.headers.authorization, res)
    let parentComment
    if(req.body.parentId){
        parentComment = await Comment.findOne({
            where:{
                id: req.body.parentId
            }
        })
    }
    await Comment.create({
        goodId: req.body.goodId,
        postCommenterId: user.id,
        postCommenterName: user.accountName,
        commentContent: req.body.commentContent,
        commentPics: req.body.commentPics,
        parentId: req.body.parentId,
        parentKey: parentComment ? parentComment.commentKey : ''
    })
    res.send({
        status: successCode,
        message: 'success'
    })
})

// 获取商品评论
/*
*  (Object: type)
*  goodId: integer
*/
router.post('/getComments', async (req, res, next) => {
    console.log(req.body)
    let comments = await Comment.findAll({
        where: {
            goodId: req.body.goodId
        },
        raw: true
    })
    if(!comments){
        return res.send({
            status: emptyCode,
            message: emptyMessage
        })
    }
    let commentList = []
    for(let comment of comments) {
        if (!comment.parentId) {
            commentList.push(comment)
        }
    }
    buildTree(comments, commentList, 'id', 'parentId')
    res.send({
        status: successCode,
        message: 'success',
        data: commentList
    })
})

// 删除评论
/*
*  (Object:type)
*  commentId: integer
*/
router.post('/deleteComment', async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    let comment = await Comment.findOne({
        where:{
            id: req.body.commentId
        }
    })
    if (comment.postCommenterId!=userData.id){
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    }
    await Comment.destroy({
        where: {
            [Op.or]:{
                id: req.body.commentId,
                parentKey: {
                    [Op.like]: `${comment.commentKey}%`
                }
            }
        }
    })
    return res.send({
        status: successCode,
        message: 'success'
    })
})

// 修改评论
/*
*  (Obejct: type)
*  commentId: integer
*  commentContent: string
*  commentPics: json
*/
router.post('/changeComment', async(req, res, next) => {
    let userData = verifyToken(req.headers.authorization, res)
    let comment = await Comment.findOne({
        where: {
            id: req.body.commentId
        }
    })
    if(userData.id != comment.postCommenterId){
        return res.send({
            status: permissionCode,
            message: permissionMessage
        })
    }
    console.log(comment.commentContent)
    comment.commentContent = req.body.commentContent
    comment.commentPics = req.body.commentPics
    comment.save()
    return res.send({
        status: successCode,
        message: 'success'
    })
})

module.exports = router