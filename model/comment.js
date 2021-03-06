const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var comment = sequelize.define('comment',{
    // 评论商品Id
    goodId:{
        type: DataTypes.INTEGER
    },
    // 发布者id
    postCommenterId: {
        type: DataTypes.INTEGER
    },
    // 发布评论者名字
    postCommenterName: {
        type: DataTypes.STRING
    },
    // 评论内容
    commentContent: {
        type: DataTypes.STRING
    },
    // 评论图片
    commentPics: {
        type: DataTypes.JSON
    },
    // 评论键(用于快速删除)
    commentKey: {
        type: DataTypes.VIRTUAL,
        get(){
            return `${this.parentKey}#${this.id}`
        }
    },
    // 父评论Id
    parentId: {
        type: DataTypes.INTEGER
    },
    // 父评论key
    parentKey: {
        type: DataTypes.STRING,
        defaultValue: ''
    }
},{
    initialAutoIncrement: 10000
})
comment.sync()
module.exports = comment