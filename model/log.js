const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var log = sequelize.define('log', {
    // 操作者ID
    operatorId: {
        type: DataTypes.INTEGER
    },
    // 操作者名字
    operatotName: {
        type: DataTypes.STRING
    },
    // 操作内容类型
    // 0:修改用户信息 1:修改商品信息 2:修改订单状态
    operateType: {
        type: DataTypes.INTEGER
    },
    // 操作前内容
    beforeOperate: {
        type: DataTypes.JSON
    },
    // 操作后内容
    afterOperate: {
        type: DataTypes.JSON
    }
})

log.sync()
module.exports = log