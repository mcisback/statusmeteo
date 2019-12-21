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

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds)
    
    return bcrypt.hashSync(password, saltRounds)
}

userSchema.pre('save', function(next){
    this.password = hashPassword(this.password)
    next()
})

userSchema.pre('updateOne', function(next){
    let data = this.getUpdate()
    const password = data.$set.password;

    console.log('Called userSchema.updateOne: ', password)
    if (!password) {
        console.log('updateOne empty password')

        return next();
    }
    try {
        data.$set.password = hashPassword(password);

        this.update({}, data).exec()
        next();
    } catch (error) {
        console.log('update Error: ', error)

        return next(error);
    }
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