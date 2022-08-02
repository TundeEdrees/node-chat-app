const users = []

// adduser, removeuser, getuser, getUsersinRoom

const addUser = ({user_id, username, room}) => {
    //clean the data]
    username = username.trim().toLowerCase()
    room = room.toLowerCase()
    
    //validate the data
    if (!username || !room) {
        return {
            error: 'username and room have to be provided'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if (existingUser) {
        return {
            error : 'Username is already taken'
        }
    }

    //storing the user
    const user = {user_id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const user_index = users.findIndex((user) => {
        return user.user_id === id
    })
    if (user_index !== -1) {
        return users.splice(user_index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.user_id===id)
    return(user)
}

const getUsersInRooms = (room_name) => {
    room_name = room_name.trim().toLowerCase()
    const roomparts = users.filter((user) => user.room===room_name)
    return roomparts
    // const usersinroom = []
    // for (i in roomparts) {
    //     usersinroom.push(roomparts[i].username)
    // }
    // return usersinroom
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRooms
}
