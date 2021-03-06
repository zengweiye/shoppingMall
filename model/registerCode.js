const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var registerCode = sequelize.define('registerCode',{
    email: {
        type: DataTypes.STRING
    },
    code: {
        type: DataTypes.STRING
    }
})
registerCode.sync()
module.exports = registerCode