console.log('Clientside javaScript file is loaded')
const socket = io()

//Elements
const theform = document.querySelector('#dform')
const $messageFormInput = theform.querySelector('input')
const $messageFormButton = theform.querySelector('button')
const $messages = document.querySelector('#messages') 

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locurlTemplate = document.querySelector('#locurl-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})
console.log(username,room)

const autoscroll = () => {
    // New message element
    
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin    

    //Visible height
    const visisbleHeight = $messages.offsetHeight

    //Height of messages container
    const contentHeight = $messages.scrollHeight
    console.log(newMessageMargin)

    //How far have we scrolled?
    const scrollOffset = $messages.scrollTop + visisbleHeight

    if (contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight

    }
}
socket.emit('join', {username,room}, (e) => {
    if(e) {
        alert(e)
        location.href = '/'
    }
})

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (locurlObject) => {
    console.log(locurlObject)
    const html = Mustache.render(locurlTemplate, {
        username : locurlObject.username,
        link: locurlObject.url,
        createdAt: moment(locurlObject.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
    // console.log(room)
    // console.log(users)
})

theform.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable button after submit
    $messageFormButton.setAttribute('disabled','disabled')

    const messg = document.querySelector('input').value
    socket.emit('messag', messg, (error) => {
        //enable back button after acknowledgement
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if(error) {
            alert(error)
            return console.log(error)
        }
        // Sending acknowledgement
        console.log('Delivered')
    })
    
})
const $sendLocationButton = document.querySelector('#share-location')


$sendLocationButton.addEventListener('click', () => {
    //disabling button after click

    $sendLocationButton.setAttribute('disabled','disbaled')

    if (!navigator.geolocation) {
        return alert ('Geolocation  is not supported by this browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        socket.emit('shareLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (mesg) => {

            // re enabling button
            $sendLocationButton.removeAttribute('disabled')
            //Sending acknowledgement
            console.log('Location shared!')
        })
    })
})



// socket.on('updatedCount', (count) => {
//     console.log(`count's been updated`, count)

// })

// const increase = document.querySelector('#increase')

// increase.addEventListener('click', () => {
//     console.log('clicked!')
//     socket.emit('increase')
// })