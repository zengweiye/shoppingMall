const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var history = sequelize.define('history', {
    // 用户ID
    userId: {
        type: DataTypes.INTEGER
    },
    // 用户浏览商品历史
    browseHistory: {
        type: DataTypes.JSON
    },
    // 浏览商品标签
    browseHistoryTag: {
        type: DataTypes.JSON
    }
})
history.sync()
module.exports = history