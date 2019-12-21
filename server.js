const express = require('express');
// const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

const fs = require('fs') // filesystem module

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const cookieParser = require("cookie-parser");

const path = require('path')

const config = require('./config')
const env = process.env.NODE_ENV || 'dev'

console.log('Using ENV: ', env)

const mongoose = require('mongoose')
const User = require('./models/user')
const Topic = require('./models/topic')
const Forum = require('./models/forum')

const models = { User, Topic, Forum }
const modelsMap = {
    'users': User,
    'topics': Topic,
    'forums': Forum
}

const api_endpoint = '/api'

const connectDb = () => {
    console.log('Connecting to DB: ', config[env].databaseUrl)

    mongoose.set('useCreateIndex', true);

    return mongoose.connect(config[env].databaseUrl, { useNewUrlParser: true, useFindAndModify: false });
}

// Enable Cors
app.use(cors())

// Log Requested Files
/*app.use(function (req, res, next) {
    var filename = path.basename(req.url)
    // var extension = path.extname(filename)

    console.log("The file " + filename + " was requested.")

    next()
})*/

// EJS Engine
// app.engine('html', require('ejs').renderFile)
// app.engine('js', require('ejs').renderFile)
// app.set('views', __dirname + config[env].publicDir)
// app.set('view engine', 'ejs')

// Read Post JSON Body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Use publicDir for static files
app.use(express.static(__dirname + config[env].publicDir))

// Static routes
app.use('/scripts', express.static(__dirname + '/node_modules'))

// Generate Client Configuration based on server configuration :)
app.get('/ng/client-config.js', (req, res, next) => {
    res.send(`
        angular.module('globalConfigModule', [])
        .constant('GlobalConfig', {
            appName: 'StatusMeteo',
            appVersion: 2.0,
            check: 'oh yes',
            appUrl: '${config[env].appUrl}'
        })
    `)
})
app.use('/ng', express.static(__dirname + config[env].publicDir + '/ng'))

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
                console.log('Token is not valid')

                return res.sendStatus(403).json({
                    success: false,
                    msg: 'Token is not valid'
                })
            } else {
                console.log('JWT decoded is: ', decoded)

                req.decoded = decoded
                next()
            }
        })
    } else {
        console.log('Token is not present')
        
        return res.sendStatus(403).json({
            success: false,
            msg: 'Auth token is not supplied'
        })
    }
}

const checkIfUserIsAdmin = (req, res, next) => {
    console.log('checkIfUserIsAdmin: ', req.decoded)

    if(req.decoded.user.is_admin === true) {
        req.is_admin = true

        next()
    } else {
        return res.sendStatus(403).json({
            success: false,
            msg: 'You are not admin'
        })
    }
}

const checkAndSetAdmin = (req, res, next) => {
    console.log('checkAndSetAdmin: ', req.decoded)

    if(req.decoded.user.is_admin === true) {
        req.is_admin = true

        next()
    }
}

// Serve Static Files and JS App
// This appears to never be called
app.get('/', function(req, res) {
    console.log('Serving Frontend on ', config[env].publicDir)

    // res.send('An alligator approaches!')

    /*fs.readFile('index.html', function (err, content) {
        if (err) {
            console.log('GET / readFile error: ', err)
        } else {
            // this is an extremely simple template engine
            var rendered = content.toString()
                .replace('##=appDomain##', config[env].appDomain)

            console.log('rendered: ', rendered)

            res.render(rendered)
        }
    })*/

    // res.sendFile('index.html')
    res.render('index.html')
})

// Get all forums
app.get(api_endpoint + '/forums', function (req, res) {
    models.Forum.find({}, function(err, data) {
        console.log('GET forums: ', err, data, data.length)

        res.json(data)
    })
})

// Get all topics
app.get(api_endpoint + '/topics', function (req, res) {
    let level = req.query.level || 1
    let noLevel = req.query.noLevel || 'false'
    let mongoquery = {}

    if(noLevel !== 'true') {
        mongoquery = {level: level}
    }

    models.Topic.find(mongoquery, function(err, data) {
        console.log('GET topics: ', err, data, data.length)

        res.json(data)
    })
})

// Get all topics by forum id
app.get(api_endpoint + '/topics/byforum/:forumId', function (req, res) {
    models.Topic.find({level: 1, forum: req.params.forumId}, function(err, data) {
        console.log('GET topics: ', err, data, req.params.forumId, data.length)

        res.json(data)
    })
})

// Get all topics by parent
app.get(api_endpoint + '/topics/byparent/:parentId', function (req, res) {
    models.Topic.find({parent: req.params.parentId}, function(err, data) {
        console.log('GET topics: ', err, data, req.params.parentId, data.length)

        res.json(data)
    })
})

// Search topics by string
app.get(api_endpoint + '/topics/search/:query', function (req, res) {
    console.log(`SEARCH Topics with query: ${req.params.query}`)
    
    models.Topic.find({
        "$or": [
            {title: {$regex: req.params.query, $options: 'i'}},
            {subtitle: {$regex: req.params.query, $options: 'i'}},
            {text: {$regex: req.params.query, $options: 'i'}}
        ]
    }, function(err, data) {
        console.log('SEARCH topics: ', err, data, req.params.query, data.length)

        res.json(data)
    })
})

// Search topics by date
app.get(api_endpoint + '/topics/searchbydate/:date', function (req, res) {
    console.log(`SEARCH TopicsByDate with date: ${req.params.date}`)
    
    models.Topic.find({
        createdAt: {$gte: new Date(req.params.date)}
    }, function(err, data) {
        console.log('SEARCH TopicsByDate: ', err, data, req.params.query, data.length)

        res.json(data)
    })
})

// Create New Topic
app.post(api_endpoint + '/topic', checkToken, function (req, res) {
    console.log('Received new topic request: ', req.body)

    const newTopic = new models.Topic(req.body)

    newTopic.save()
        .then(topic => {
            console.log('Saved Topic: ', topic)

            if(topic.parent != null) {
                const parentTopic = models.Topic.findById(topic.parent)

                console.log('Found parent topic: ', parentTopic)

                parentTopic.topics.push(topic.id)

                parentTopic.save()
                    .then(p => {
                        console.log('Saved parent topic: ', parentTopic)

                        res.json({success: true, data:{msg: req.body, parent: parentTopic}})
                    })
                    .catch(err => {
                        console.log('Saving parent topic error: ', err)

                        res.json({success: false, data:{msg: err, parent: null}})
                    })
            } else {
                res.json({success: true, data:{msg: req.body, parent: null}})
            }
        })
        .catch(err => {
            console.log('Error Saving: ', err)

            res.json({success: false, data:{msg: err, parent: null}})
        })
})

// Delete Topic
app.delete(api_endpoint + '/topic/delete/:topicId', checkToken, function (req, res) {

    models.Topic.findByIdAndRemove(req.params.topicId, req.body, function(err, doc) {
        if (err) {
            let r = {success:  false, data: {msg: err}}

            console.log('Topic DELETE Error: ', r)

            res.json(r)
        } else {
            console.log('Topic DELETE Success', doc)

            res.json({success: true, data: {msg: doc}})
        }
    })
})

// Modify Topic
// TODO Check Topic Owner
app.put(api_endpoint + '/topic/edit/:topicId', checkToken, function (req, res) {

    console.log('Modifying TOPIC ID: ', req.params.topicId)
    // console.log('req, res: ', req, res)

    console.log('New Data: ', req.body)

    models.Topic.findOneAndUpdate({_id: req.params.topicId}, req.body, {new: true}, (err, doc) => {
        if (err) {
            let r = {success:  false, data:{msg: err}}

            console.log('Topic UPDATE Error: ', r)

            res.json(r)
        } else {
            console.log('UPDATE Topic Success')

            res.json({success: true, data:{msg: doc}})
        }
    })
    // res.json({"msg": "Not Yet Implemented"})
})

// Get one topic by id
app.get(api_endpoint + '/topic/get/:topicId', function (req, res) {
    console.log('Getting Topic with TOPIC ID: ', req.params.topicId)

    models.Topic
        .findOne({_id: req.params.topicId})
        .exec((err, topic) => {
            if(err) {
                console.log('GET TOPIC Failed', err)

                res.json({success:  false, data:{msg: err}})
            } else {
                console.log('Found Topic: ', topic)

                res.json({success: true, data:{msg: topic}})
            }
        })
})

// Reply To Topic
app.post(api_endpoint + '/topic/reply/:topicId', checkToken, function (req, res) {

    console.log('Replying to TOPIC ID: ', req.params.topicId)
    console.log('req.body: ', req.body)
    // console.log('req.topics: ', req.body.topics)

    models.Topic.findOne({_id: req.params.topicId})
        .exec((err, topic) => {
            if(err) {
                console.log('Replying Failed', err)

                res.json({success:  false, data:{msg: err}})
            } else {
                if(topic == null ){
                    console.log('REPLY Found Topic IS NULL: ', topic)

                    res.json({success:  false, data:{msg: null}})
                }
                console.log('REPLY Found Topic: ', topic)

                const reply = new models.Topic(req.body)

                reply.save((err, doc) => {
                    if(err){
                        console.log('reply.save Failed', err)

                        res.json({success:  false, data:{msg: err}})
                    } else {
                        console.log('reply.save success')
                       
                        topic.topics.push(reply.id)

                        topic.save((err, data) => {
                            if(!err){
                                console.log('topic.save success', topic)

                                res.json({success: true, data:{msg: topic, reply: reply}})
                            } else {
                                console.log('topic.save failed', topic)

                                res.json({success: false, data:{msg: err}})
                            }
                        })
                    }
                })
            }
        })
})

// Get all users (for admin)
app.get(api_endpoint + '/users', checkToken, checkIfUserIsAdmin, function (req, res) {
    models.User.find({}, function(err, data) {
        console.log(err, data, data.length)

        res.json(data)
    })
})

// Get field types (for admin)
app.get(api_endpoint + '/getfields/:collection', checkToken, checkIfUserIsAdmin, function (req, res) {
    let _data = []

    console.log('Requesting fields for collection: ', req.params.collection)

    modelsMap[req.params.collection].schema.eachPath(function(key) {
        _data.push({
            key: key,
            type: modelsMap[req.params.collection].schema.path(key).instance.toLowerCase()
        })
    })

    console.log('_data', _data)

    res.json({success: true, data:{msg: 'Success', data: _data}})
})



// Create New user (for registration)
app.post(api_endpoint + '/user/register', function (req, res) {
    // res.json({"msg": "Not Yet Implemented"})

    console.log('Creating new user with data: ', req.body)

    models.User.create(req.body, (err, doc) => {
        console.log('err, doc: ', err, doc)

        if(err) {
            console.log('Create User Error!!! ')

            res.json({success: false, data: {
                msg: err
            }})
        } else {
            console.log('Create User Success!!! ')

            res.json({success: true, data: {
                msg: doc
            }})
        }
    })
})

// Delete user (for user or admin)
app.delete(api_endpoint + '/user/delete/:userId', checkToken, checkIfUserIsAdmin, function (req, res) {
    models.User.findByIdAndRemove(req.params.userId, req.body, function(err, doc) {
        if (err) {
            let r = {success:  false, data: {msg: err}}

            console.log('User DELETE Error: ', r)

            res.json(r)
        } else {
            console.log('User DELETE Success', doc)

            res.json({success: true, data: {msg: doc}})
        }
    })
})

// Delete users (for user or admin)
app.post(api_endpoint + '/user/deletemany/', checkToken, checkIfUserIsAdmin, function (req, res) {
    let _ids = req.body.map(item => mongoose.Types.ObjectId(item))

    console.log('\nDeleting Many Users: ', req.body, _ids)

    try {
        models.User.remove({'_id': {'$in': _ids}})
    } catch(err) {
        console.log('DeleteManyUsers Catched an Error: ', err)
        
        res.json({success: false, data: {msg: err}})
    }

    res.json({success: true, data: {msg: 'Users Deleted'}})
})

// Modify user (for user or admin)
app.put(api_endpoint + '/user/edit/:userId', checkToken, checkAndSetAdmin, function (req, res) {
    // res.json({"msg": "Not Yet Implemented"})

    console.log('Modifying User: ', req.params.userId)

    models.User.findOneAndUpdate({_id: req.params.userId}, req.body, {upsert:false}, (err, doc) => {
        if(err) {
            console.log('Edit User Error!!! ')

            res.json({success: false, data: {
                msg: err
            }})
        } else {
            console.log('Edit User Success!!! ')

            res.json({success: true, data: {
                msg: doc
            }})
        }
    })
})

// Do Login
app.post(api_endpoint + '/login', function (req, res) {
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
                    var expTime = new Date()

                    expTime.setTime(expTime.getTime() + (60 * 60 * 24 * 1000))

                    console.log('LOGIN Setting Exp time to: ', expTime)

                    const token = jwt.sign({id: user._id, user: user}, config[env].secretKey, { expiresIn: '24h' });
                    
                    res.json({success: true, data: {msg: "user found!!!", user: user, token: token, exptime: expTime.getTime()}});
                } else {
                    res.json({success: false, data: {msg: "Invalid email/password!!!"}});
                }
            }
        })
        .catch(err => {
            console.log('User Login Error: ', err)

            res.json({success: false, data: err})
        })
})

const seedDb = async () => {
    const superAdmin = new models.User({
        username: 'supermeteo',
        password: 'supermeteo',
        email: 'info@statusmeteo.it',
        group_id: 1000,
        is_admin: true,
        registered_at: new Date().getTime()
    })

    const normalUser = new models.User({
        username: 'normaluser',
        password: 'normaluser',
        email: 'normaluser@gmail.com',
        group_id: 4001,
        is_admin: false,
        registered_at: new Date().getTime()
    })

    const forum1 = new models.Forum({
        title: 'NowCasting',
        color: '#00f',
        order: 0,
        is_active: true,
        forum_type: 'NowCasting'
    })

    const forum2 = new models.Forum({
        title: 'Discussioni',
        color: 'green',
        order: 1
    })

    const forum3 = new models.Forum({
        title: 'Varie & Strumentazione',
        color: '#7e5530',
        order: 2
    })

    const forum4 = new models.Forum({
        title: 'Funghi',
        color: 'red',
        order: 3
    })

    const topic1 = new models.Topic({
        parent: null,
        title:'AngularJS Forum 1',
        subtitle: 'Learn Angular',
        level: 1,
        text: "Lorem Ipsum dsadnoasdnoasdmoa 1",
        timestamp: new Date().getTime(),
        maxTm: new Date().getTime(),
        topics: [],
        username: normalUser.username,
        user: normalUser.id,
        forum: forum1.id
    })

    const subtopic1 = new models.Topic({
        parent: topic1.id,
        title:'AngularJS Basics Forum 1',
        subtitle: 'Learn Angular Basics',
        level: 2,
        text: "Lorem Ipsum dsadnoasdnoasdmoa 3",
        timestamp: new Date().getTime() + 100,
        maxTm: new Date().getTime() + 100,
        topics: [],
        username: normalUser.username,
        user: normalUser.id,
        forum: forum1.id
    })

    const subsubtopic1 = new models.Topic({
        parent: subtopic1.id,
        title:'AngularJS Basics Subsubtopics',
        subtitle: 'Learn Angular Basics Subsubtopics',
        level: 3,
        text: "Lorem Ipsum dsadnoasdnoasdmoa 88",
        timestamp: new Date().getTime() + 100,
        maxTm: new Date().getTime() + 100,
        topics: [],
        username: superAdmin.username,
        user: superAdmin.id,
        forum: forum2.id
    })

    subtopic1.topics.push(subsubtopic1)

    topic1.topics.push(subtopic1.id)

    const topic2 = new models.Topic({
        parent: null,
        title:'VueJS Forum 2',
        subtitle: 'Learn VueJS',
        level: 1,
        text: "Lorem Ipsum dsadnoasdnoasdmoa 2",
        timestamp: new Date().getTime(),
        maxTm: new Date().getTime(),
        topics: [],
        username: normalUser.username,
        user: normalUser.id,
        forum: forum2.id
    })

    const topic3 = new models.Topic({
        parent: null,
        title:'AngularJS Forum 2',
        subtitle: 'Learn Angular',
        level: 1,
        text: "Lorem Ipsum dsadnoasdnoasdmoa 1",
        timestamp: new Date().getTime(),
        maxTm: new Date().getTime(),
        topics: [],
        username: normalUser.username,
        user: normalUser.id,
        forum: forum2.id
    })

    const subtopic2 = new models.Topic({
        parent: topic3.id,
        title:'AngularJS Basics Forum 2',
        subtitle: 'Learn Angular Basics',
        level: 2,
        text: "Lorem Ipsum dsadnoasdnoasdmoa 3",
        timestamp: new Date().getTime() + 100,
        maxTm: new Date().getTime() + 100,
        topics: [],
        username: normalUser.username,
        user: normalUser.id,
        forum: forum2.id
    })

    topic3.topics.push(subtopic2.id)

    const topic4 = new models.Topic({
        parent: null,
        title:'Strumentazione',
        subtitle: 'Strumentazione varia',
        level: 1,
        text: "Lorem Ipsum dsadnoasdnoasdmoa 1",
        timestamp: new Date().getTime(),
        maxTm: new Date().getTime(),
        topics: [],
        username: normalUser.username,
        user: normalUser.id,
        forum: forum3.id
    })

    const topic5 = new models.Topic({
        parent: null,
        title:'Funghi Porcini',
        subtitle: 'Discussione sui funghi porcini',
        level: 1,
        text: "Lorem Ipsum dsadnoasdnoasdmoa 1",
        timestamp: new Date().getTime(),
        maxTm: new Date().getTime(),
        topics: [],
        username: normalUser.username,
        user: normalUser.id,
        forum: forum4.id
    })

    await forum1.save().catch(err => console.log(err))
    await forum2.save().catch(err => console.log(err))
    await forum3.save().catch(err => console.log(err))
    await forum4.save().catch(err => console.log(err))
    
    await topic1.save().catch(err => console.log(err))
    await topic2.save().catch(err => console.log(err))
    await topic3.save().catch(err => console.log(err))
    await topic4.save().catch(err => console.log(err))
    await topic5.save().catch(err => console.log(err))

    await subtopic1.save().catch(err => console.log(err))
    await subtopic2.save().catch(err => console.log(err))

    await subsubtopic1.save().catch(err => console.log(err))

    await superAdmin.save().catch(err => console.log(err))
    await normalUser.save().catch(err => console.log(err))
}

var server = null;
var eraseDatabaseOnSync = true;

if(env === 'prod') {
    eraseDatabaseOnSync = false;
}

console.log('[+] Do eraseDatabaseOnSync ? ', eraseDatabaseOnSync)

connectDb().then(async () => {
    if (eraseDatabaseOnSync) {
        console.log('[+] Erasing Database On Sync')
        
        await Promise.all([
          models.User.deleteMany({}),
          models.Forum.deleteMany({}),
          models.Topic.deleteMany({}),
        ]);
        
        console.log('[+] Seeding DB On Sync')
        seedDb()
    }

    server = app.listen(config[env].port, () => {
        const host = server.address().address
        const port = server.address().port
        
        console.log('Forum app listening at http://%s:%d', host, port)
    })
})