const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var recommendByGood = sequelize.define('recommendByGood', {
    // 商品Id
    goodId: {
        type: DataTypes.INTEGER
    },
    // 相关商品
    /**
     * [
     *      {
     *          goodId: integer,
     *          timeNumber: integer
     *      }
     * ]
     */
    relatedGoods: {
        type: DataTypes.JSON
    },
    // 相关商品标签
    /**
     * [
     *      {
     *          tag: string
     *          timeNumber: integer
     *      }
     * ]
     */
    relatedGoodTags: {
        type: DataTypes.JSON
    }
})
recommendByGood.sync()
module.exports = recommendByGood