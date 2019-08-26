var express = require('express');
// const bodyParser = require('body-parser')
var cors = require('cors')
var app = express();

var path = require('path');

const port = 8081
const publicDir = '/frontend'

// Enable Cors
app.use(cors())

// Use publicDir for static files
app.use(express.static(__dirname + publicDir));

// Read Post JSON Body
app.use(express.json())

// Topics Database
const topics = require('./topics.js')

// Serve Static Files and JS App
app.get('/', function(req, res) {
    console.log('Serving Frontend on ', publicDir)

    res.sendFile('index.html')
})

// Get all topics
app.get('/api/topics', function (req, res) {
    res.json(topics.topics)
})

// Create New Topic
app.post('/api/topic', function (req, res) {
    console.log('Received new topic request: ', req.body)

    res.json({"msg": req.body})
})

// Delete Topic
app.delete('/api/topic/:topicId', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Modify Topic
app.put('/api/topic/:topicId', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Get all users (for admin)
app.get('/api/users', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Create New user (for registration)
app.post('/api/user', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Delete user (for user or admin)
app.delete('/api/user/:userId', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Modify user (for user or admin)
app.put('/api/user/:userId', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log('Forum app listening at http://%s:%d', host, port)
})