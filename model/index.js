var Sequelize = require('sequelize')
var sequelize = new Sequelize(
    'mydb',
    'root',
    '123456',
    {
        'dialect': 'mysql',
        'host': 'localhost',
        'port': 3306
    }
)
module.exports = sequelize