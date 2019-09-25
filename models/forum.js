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

const forumSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: false,
        required: true
    },
    color: {
        type: String,
        unique: false,
        required: true
    },
    order: {
        type: Number,
        unique: true,
        required: true
    },
    is_active: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    }
}, {timestamps: true});

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;