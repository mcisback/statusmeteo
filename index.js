const express = require('express');
// const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const path = require('path')

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
}

// Enable Cors
app.use(cors())

// Use publicDir for static files
app.use(express.static(__dirname + config[env].publicDir));

// Read Post JSON Body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const checkToken = (req, res, next) => {
    console.log('checkToken headers: ', req.headers)

    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

    if (token) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length)
        }

        jwt.verify(token, config[env].secretKey, (err, decoded) => {
            if (err) {
                return res.sendStatus(403).json({
                    success: false,
                    message: 'Token is not valid'
                })
            } else {
                req.decoded = decoded
                next()
            }
        })
    } else {
        return res.sendStatus(403).json({
            success: false,
            message: 'Auth token is not supplied'
        })
    }
}

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
})

// Create New Topic
app.post('/api/topic', checkToken, function (req, res) {
    console.log('Received new topic request: ', req.body)

    const newTopic = new models.Topic(req.body)

    newTopic.save()

    res.json({"msg": req.body})
})

// Delete Topic
app.delete('/api/topic/:topicId', checkToken, function (req, res) {

    models.Topic.findById(req.params.topicId, function (err, doc) {
        if (err) {
            let r = {success:  "error", msg: err}

            console.log('Topic DELETE Error: ', r)

            res.json(r)
        } else {
            doc.remove().exec(); //Removes the document
        }
    })
})

// Modify Topic
app.put('/api/topic/:topicId', checkToken, function (req, res) {
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

// Do Login
app.post('/api/login', function (req, res) {
    console.log('New Login Request: ', req.body)
    console.log('User: ', req.body.login)

    let user = null
    
    models.User.findByLogin(req.body.login)
        .then(user => {
            if(user === null) {
                console.log('User Not Found: ', user)

                res.json({success: false, data: {msg: 'User Not Found', user: user, body: req.body}})
            } else {
                // const jwt = require('jsonwebtoken')

                console.log('Found User: ', user)

                if(bcrypt.compareSync(req.body.password, user.password)) {
                    const token = jwt.sign({id: user._id}, config[env].secretKey, { expiresIn: '3h' });
                    
                    res.json({success: true, data: {msg: "user found!!!", user: user, token: token}});
                } else {
                    res.json({success: false, data: {msg: "Invalid email/password!!!"}});
                }
            }
        })
        .catch(err => {
            console.log('User Login Error: ', err)

            res.json({success: true, data: err})
        })
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
        username: 'normaluser',
        password: 'normaluser!!!',
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