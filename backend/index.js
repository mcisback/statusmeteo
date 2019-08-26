var express = require('express');
var cors = require('cors')
var app = express();

const port = 8081

app.use(cors())

const topics = require('./topics.js')

app.get('/topics', function (req, res) {
   res.json(topics.topics)
})

var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log('Forum app listening at http://%s:%d', host, port)
})