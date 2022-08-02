const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')


const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRooms} = require('./utils/users')
const { emit } = require('process')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketio(server)

//socket.emit, io.emit, socket.broadcast.emit

// server (emit) -> client (receive) - updatedCount
// client (emit) -> server (receive) - increase
io.on('connection', (socket) => {
    console.log('New websocket connection')

// Done with a function in utils/messages to prevent duplicate code
    // socket.emit('message', {
    //     text:'Welcome',
    //     createdAt: new Date().getTime()
    // })

    //Socket Rooms
    socket.on('join', ({username, room}, callback) => {
        const {error, user}= addUser({user_id: socket.id, username, room})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage("Admin",'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin",`New user ${user.username} joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRooms(user.room)
        })
        callback()
        // io.to.emit, socket.broadcast.to.emit to send to rooms
    })

    socket.on('messag', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Profanity not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username,msg))
        callback()
    })


    socket.on('shareLocation', (coord, callback) => {
        const user = getUser(socket.id)
        console.log(coord)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coord.latitude},${coord.longitude}`))
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message', generateMessage("Admin",`${user.username} left the room.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRooms(user.room)
            })
        }
    })

    // socket.emit('updatedCount', count)

    // socket.on('increase', () => {
    //     count++
    //     //socket.emit('updatedCount', count)
    //     io.emit('updatedCount', count)
    // })
})



app.get('', (req,res) => {
    res.send('index.html')
})
server.listen(port, () => {
    console.log('Server is up on port ' + port)
})