const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')
var admin = sequelize.define('admin', {
    // 名称
    name: {
        type: DataTypes.STRING(10)
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
    // 真实姓名
    trueName: {
        type: DataTypes.STRING(30)
    },
    // 头像
    headPicture: {
        type: DataTypes.STRING
    },
    // 手机号码
    phoneNumber: {
        type: DataTypes.STRING(11)
    },
    // 身份证号
    idCardNumber: {
        type: DataTypes.STRING(20)
    },
    // 身份证正面照片
    idCardPicture: {
        type: DataTypes.STRING
    },
    // 状态
    status: {
        type: DataTypes.STRING
    }
}, {
    initialAutoIncrement: 10001
})
admin.sync()
module.exports = admin