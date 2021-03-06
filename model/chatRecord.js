const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var chatRecord = sequelize.define('chatRecord', {
    // 用户ID
    userId: {
        type: DataTypes.INTEGER
    },
    // 用户名称
    userName: {
        type: DataTypes.STRING
    },
    // 离线聊天记录
    // 最多保存100条
    /**
     * {
     *      chatName: [
     *          {
     *              senderName: message        
     *          }
     *      ]
     * }
     */
    chatRecords: {
        type: DataTypes.JSON
    }
})
chatRecord.sync()
module.exports = chatRecord