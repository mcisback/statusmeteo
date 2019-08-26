const express = require('express');
// const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();

const path = require('path');

const config = require('./config')
const env = 'dev' || process.env.ENV

console.log('Using ENV: ', env)

const mongoose = require('mongoose')
const User = require('./models/user')
const Topic = require('./models/topic')

const models = { User, Topic }

const connectDb = () => {
    console.log('Connecting to DB: ', config[env].databaseUrl)

    mongoose.set('useCreateIndex', true);

    return mongoose.connect(config[env].databaseUrl, { useNewUrlParser: true });
};

// Enable Cors
app.use(cors())

// Use publicDir for static files
app.use(express.static(__dirname + config[env].publicDir));

// Read Post JSON Body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Topics Database
const topics = require('./topics.js')

// Serve Static Files and JS App
app.get('/', function(req, res) {
    console.log('Serving Frontend on ', publicDir)

    res.sendFile('index.html')
})

// Get all topics
app.get('/api/topics', function (req, res) {
    models.Topic.find({}, function(err, data) {
        console.log(err, data, data.length)

        res.json(data)
    })

    // res.json(topics.topics)
})

// Create New Topic
app.post('/api/topic', function (req, res) {
    console.log('Received new topic request: ', req.body)

    const newTopic = new models.Topic(req.body)

    newTopic.save()

    res.json({"msg": req.body})
})

// Delete Topic
app.delete('/api/topic/:topicId', function (req, res) {

    models.Topic.findById(req.params.topicId, function (err, doc) {
        if (err) {
            let r = {status: "error", msg: err}

            console.log('Topic DELETE Error: ', r)

            res.json(r)
        } else {
            doc.remove().exec(); //Removes the document
        }
    })

    // res.json({"msg": "Not Yet Implemented"})
})

// Modify Topic
app.put('/api/topic/:topicId', function (req, res) {
    res.json({"msg": "Not Yet Implemented"})
})

// Get all users (for admin)
app.get('/api/users', function (req, res) {
    models.User.find({}, function(err, data) {
        console.log(err, data, data.length)

        res.json(data)
    })
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

const seedDb = async () => {
    const superAdmin = new models.User({
        username: 'supermeteo',
        password: 'supermeteo!!!',
        email: 'info@statusmeteo.it',
        group_id: 1000,
        is_admin: true,
        registered_at: new Date().getTime()
    })

    const normalUser = new models.User({
        username: 'normalUser',
        password: 'normalUser!!!',
        email: 'normaluser@gmail.com',
        group_id: 4001,
        is_admin: false,
        registered_at: new Date().getTime()
    })

    const topic1 = new models.Topic({
        parent: 0,
        title:'AngularJS',
        subtitle: 'Learn Angular',
        text: "Lorem Ipsum dsadnoasdnoasdmoa 1",
        timestamp: new Date().getTime(),
        maxTm: new Date().getTime(),
        topics: [],
        user: normalUser.id
    })

    topic1.topics.push({
        parent: topic1.id,
        title:'AngularJS Basics',
        subtitle: 'Learn Angular Basics',
        text: "Lorem Ipsum dsadnoasdnoasdmoa 3",
        timestamp: new Date().getTime() + 100,
        maxTm: new Date().getTime() + 100,
        topics: [],
        user: normalUser.id
    })

    const topic2 = new models.Topic({
        parent: 0,
        title:'VueJS',
        subtitle: 'Learn VueJS',
        text: "Lorem Ipsum dsadnoasdnoasdmoa 2",
        timestamp: new Date().getTime(),
        maxTm: new Date().getTime(),
        topics: [],
        user: normalUser.id
    })

    await topic1.save()
    await topic2.save()
    await superAdmin.save()
    await normalUser.save()
}

var server = null;
const eraseDatabaseOnSync = true;

connectDb().then(async () => {
    if (eraseDatabaseOnSync) {
        await Promise.all([
          models.User.deleteMany({}),
          models.Topic.deleteMany({}),
        ]);
    }

    seedDb()

    server = app.listen(config[env].port, () => {
        const host = server.address().address
        const port = server.address().port
        
        console.log('Forum app listening at http://%s:%d', host, port)
    })
})