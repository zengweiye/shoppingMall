const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')
var user = sequelize.define('user',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // 名称
    userName:{
        type: DataTypes.STRING(30)
    },
    // 真实姓名
    trueName: {
        type: DataTypes.STRING(30)
    },
    // 头像
    headPicture: {
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
        type: DataTypes.STRING(6)
    },
    // 手机号码
    phoneNumber: {
        type: DataTypes.STRING(11)
    },
    // 邮箱
    email: {
        type: DataTypes.STRING(30)
    },
    // 地址
    address: {
        type: DataTypes.JSON
    },
    // 是否商家
    isMerchant: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // 身份证正面照片
    idCardPicture: {
        type: DataTypes.STRING
    },
    // 身份证号
    idCardNumber: {
        type: DataTypes.STRING(20)
    },
    // 用户状态
    status: {
        type: DataTypes.STRING
    }
},{
    initialAutoIncrement: 10001
})
user.sync()
module.exports = user