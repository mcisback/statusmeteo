/*
{
    id: 1001,
    parent: 0,
    title:'AngularJS',
    subtitle: 'subtitle',
    text: "Lorem Ipsum dsadnoasdnoasdmoa",
    timestamp: 2022,
    maxTm: 0,
    topics: []
},
*/

const mongoose = require('mongoose')

const topicSchema = new mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    title: {
        type: String,
        unique: false,
        required: true
    },
    level: {
        type: Number,
        unique: false,
        required: true
    },
    subtitle: {
        type: String,
        unique: false,
        required: true
    },
    text: {
        type: String,
        unique: false,
        required: true
    },
    timestamp: {
        type: Number,
        unique: false,
        required: true
    },
    maxTm: {
        type: Number,
        unique: false,
        required: true
    },
    username: {
        type: String,
        unique: false,
        required: true
    },
    topics: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' } ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' }
}, {timestamps: true});

const autoPopulateChildren = function(next) {
    this.populate('topics').populate('forum', '_id title')
    next()
}

topicSchema
.pre('findOne', autoPopulateChildren)
.pre('find', autoPopulateChildren)

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;