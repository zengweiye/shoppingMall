const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')
var registerCode = sequelize.define('registerCode',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(30)
    },
    code: {
        type: DataTypes.STRING(6)
    }
})
registerCode.sync()
module.exports = registerCode