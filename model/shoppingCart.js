const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var shoppingCart = sequelize.define('shoppingCart',{
    // 用户ID
    userId:{
        type: DataTypes.INTEGER
    },
    // 购物车
    // [
    //     {
    //         merchantId: 商家ID,
    //         merchantName: 商家名称,
    //         goodId: 商品ID,
    //         goodName: 商品名称,
    //         goodPic: 商品图片
    //         amount: 数量,
    //         goodPrice: 价格
    //     }
    // ]
    goods:{
        type: DataTypes.JSON,
    }
},{
    initialAutoIncrement: 10000
})
shoppingCart.sync()
module.exports = shoppingCart