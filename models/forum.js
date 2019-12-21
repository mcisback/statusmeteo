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
    },
    forum_type: {
        type: String,
        unique: false,
        required: false,
        default: 'Discussion'
    }
}, {timestamps: true});

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;