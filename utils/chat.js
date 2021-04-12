/*
** 单对单聊天
** 主要协议：socket
*/
const moment = require('moment')
const _ = require('underscore')
const ChatRecord = require('../model/chatRecord')
const USER_STATUS = ['ONLINE', 'OFFLINE'];
const users = {}

module.exports = server => {
    const io = require('socket.io')(server,{cors:true})

    io.on('connection',socket => {
        console.log(socket.id,'success')
        // 连接
        // 上线时将数据库中的部分聊天记录展示出来

        socket.on('online', user => {
            socket.userName = user.name
            socket.userId = user.id
            users[user.name] = {
                userId: user.id,
                socketId: socket.id,
                status: USER_STATUS[0]
            }
            console.log('online', users)
        })

        // 聊天
        // 在线时直接socket接受信息
        // 离线时将部分内容存到数据库
        /*
        ** name: type
        ** params: {
        **   senderName: string
        **   senderId: integer
        **   receiverName: string
        **   receiverId: integer
        **   message: string
        ** }
        */
        socket.on('sendMessage', async(params) => {
            console.log(params)
            let senderName = params.senderName
            let senderId = params.senderId
            let receiverName = params.receiverName
            let receiverId = params.receiverId
            let message = params.message
            params.createTime = moment().format('YYYY-MM-DD HH:mm:ss');

            // 记录保存到数据库
            // 保存到发送者数据库
            if(senderName != 'admin'){
                console.log(senderId)
                let senderChatRecords = await ChatRecord.findOne({
                    where: {
                        userId: senderId
                    }
                })
                console.log(senderChatRecords)
                if ( !senderChatRecords ) {
                    console.log('create')
                    senderChatRecords = await ChatRecord.create({
                        userId: senderId,
                        userName: senderName,
                        chatRecords: {}
                    })
                }
                if ( !senderChatRecords.chatRecords[receiverName] ) {
                    senderChatRecords.chatRecords[receiverName] = []
                }
                console.log(senderChatRecords.chatRecords[receiverName])
                let chatRecords = JSON.parse(JSON.stringify(senderChatRecords.chatRecords))
                let tmpChatRecords = chatRecords[receiverName]

                //判断信息数量，最多一百条
                let receiverObj = {}
                receiverObj[senderName] = message
                tmpChatRecords.push( receiverObj )
                if( tmpChatRecords.length > 100 ) {
                    tmpChatRecords.shift()
                }
                
                senderChatRecords.chatRecords = chatRecords
                console.log(senderChatRecords.chatRecords[receiverName])
                senderChatRecords.save()
            }
            // 保存到接收者数据库
            let receiverChatRecords = await ChatRecord.findOne({
                where: {
                    userId: receiverId
                }
            })
            if ( !receiverChatRecords ) {
                receiverChatRecords = await ChatRecord.create({
                    userId: receiverId,
                    userName: receiverName,
                    chatRecords: {}
                })
            }
            if ( !receiverChatRecords.chatRecords[senderName] ) {
                receiverChatRecords.chatRecords[senderName] = []
            }
            chatRecords = JSON.parse(JSON.stringify(receiverChatRecords.chatRecords))
            tmpChatRecords = chatRecords[senderName]
            //判断信息数量，最多一百条
            let obj = {}
            obj[senderName] = message
            tmpChatRecords.push( obj )
            if( tmpChatRecords.length > 100 ) {
                tmpChatRecords.shift()
            }
            receiverChatRecords.chatRecords = chatRecords
            console.log(receiverChatRecords.chatRecords[senderName])
            receiverChatRecords.save()

            const receiver = users[params.receiverName]
            if (receiver && receiver.status === USER_STATUS[0]) {
                console.log(params.receiverName)
                socket.to(users[params.receiverName].socketId).emit('receiveMessage', params);
            }
        })


        socket.on('disconnect', reason => {
            console.log('disconnect: ', reason);
            
            if (users[socket.username]) {
              users[socket.username].status = USER_STATUS[1];
            }
          });
    })
}