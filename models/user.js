/*
exports.users = [
    {
        id: 1001,
        group_id: 4001,
        name: 'cibio123',
        pass: 'asdrubale123',
        is_admin: false,
        registered_at: 1566830237984,
    },
    {
        id: 1001,
        group_id: 4001,
        name: 'statusmeteo',
        pass: 'password',
        is_admin: false,
        registered_at: 1566830238000,
    }
]
*/

const mongoose = require('mongoose')

const bcrypt = require('bcrypt')
const saltRounds = 10

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    /*group_id: {
        type: Number,
        unique: false,
        default: 4001
    },*/
    password: {
        type: String,
        unique: false,
        required: true
    },
    is_admin: {
        type: Boolean,
        unique: false,
        default: false
    }
}, {timestamps: true})

userSchema.pre('save', function(next){
    this.password = bcrypt.hashSync(this.password, saltRounds)
    next()
})

userSchema.statics.findByLogin = async function (login) {
    let user = await this.findOne({
        username: login,
    })

    if (!user) {
        user = await this.findOne({ email: login })
    }
    
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User