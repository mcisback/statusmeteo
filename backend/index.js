var express = require('express');
const bodyparser= require('body-parser')
var cors = require('cors')
var app = express();

var path = require('path');

const port = 8081

app.use(cors())

app.use(express.static(__dirname + '/frontend'));

app.use(bodyparser.urlencoded({extended: true}))

const topics = require('./topics.js')

// Serve Static Files and JS App
app.get('/', function(req, res) {
    res.sendFile('index.html')
})

// Get all topics
app.get('/api/topics', function (req, res) {
    res.json(topics.topics)
})

// Create New Topic
app.post('/api/topic', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Delete Topic
app.delete('/api/topic', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Modify Topic
app.put('/api/topic', function (req, res) {
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
app.delete('/api/user', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Modify user (for user or admin)
app.put('/api/user', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log('Forum app listening at http://%s:%d', host, port)
})