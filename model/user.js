const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')
var user = sequelize.define('user',{
    // 名称
    accountName:{
        type: DataTypes.STRING
    },
    // 头像
    headPic: {
        type: DataTypes.STRING  
    },
    // 性别
    /**
     * 1: 男
     * 0: 女
     */
    sex: {
        type: DataTypes.INTEGER
    },
    // 密码
    password:{
        type: DataTypes.STRING,
        set(password){
            if(password){
                this.setDataValue('password',bcrypt.hashSync(password,10))
            }
        }
    },
    // 验证码
    code: {
        type: DataTypes.STRING
    },
    // 手机号码
    phoneNumber: {
        type: DataTypes.STRING
    },
    // 邮箱
    email: {
        type: DataTypes.STRING
    },
    // 地址
    address: {
        type: DataTypes.JSON
    },
    // 是否商家
    isMerchant: {
        type: DataTypes.STRING
    }
},{
    initialAutoIncrement: 10000
})
user.sync()
module.exports = user