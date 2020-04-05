const express = require('express')
const app = express()

/* Set the template engine to EJS */
app.set('view engine', 'ejs')

/* Make sure the app uses the 'public' directory for static content */
app.use(express.static('public'))

var server = app.listen(3000)
const io = require('socket.io')(server)
