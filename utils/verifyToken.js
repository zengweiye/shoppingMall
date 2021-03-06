const { tokenKey, errorCode } = require('../config/config')
const jwt = require('jsonwebtoken')

module.exports = function ( authorization, res ) {
    if(!authorization){
        res.send({
            status: errorCode,
            message: '用户登录过期，请登录'
        })
        res.end()
    }
    let token = authorization.split(' ').pop()
    let userData
    jwt.verify(token,tokenKey, (err,result) => {
        if(err) {
            res.send({
                status: errorCode,
                message: '用户登录过期，请登录'
            })
            res.end()
        } else {
            userData = result
        }
    })
    return userData
}