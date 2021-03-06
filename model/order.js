const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var order = sequelize.define('order', {
    // 用户Id
    userId:{
        type: DataTypes.INTEGER
    },
    // 用户名称
    userName:{
        type: DataTypes.STRING
    },
    // 店家Id
    merchantId: {
        type: DataTypes.INTEGER
    },
    // 店家名称
    merchantName: {
        type: DataTypes.STRING
    },
    // 商品名称
    goodName: {
        type: DataTypes.STRING
    },
    // 商品Id
    goodId: {
        type: DataTypes.INTEGER
    },
    // 商品数量
    goodAmount: {
        type: DataTypes.INTEGER
    },
    // 商品价格
    goodPrice: {
        type: DataTypes.INTEGER
    },
    // 订单状态
    // 0:待付款 1:待发货 2:待收货 3:待评价 4:已评价
    orderStatus: {
        type: DataTypes.INTEGER
    }
},{
    initialAutoIncrement: 10000
})
order.sync()
module.exports = order