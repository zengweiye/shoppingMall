const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var good = sequelize.define('good',{
    // 商品店家ID
    merchantId:{
        type: DataTypes.INTEGER
    },
    // 商品店家名称
    merchantName:{
        type: DataTypes.STRING
    },
    // 商品名称
    goodName: {
        type: DataTypes.STRING(30)
    },
    // 商品数量
    goodAmount: {
        type: DataTypes.INTEGER
    },
    // 商品图片
    goodPictures: {
        type: DataTypes.JSON
    },
    // 商品标签
    goodTag: {
        type: DataTypes.STRING(10)
    },
    // 商品价格
    goodPrice: {
        type: DataTypes.INTEGER
    },
    // 商品单位
    goodUnit: {
        type: DataTypes.STRING(10)
    },
    // 商品销量
    goodSellAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // 详细内容
    goodDetail: {
        type: DataTypes.STRING
    }
},{
    initialAutoIncrement: 10001
})
good.sync()
module.exports = good