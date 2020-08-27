const { Schema } = require('mongoose');
const { model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true
    },
    password : {
        type : String,
        minlength: 6,
        required : true
    }
});

userSchema.pre('save', async function(next) {

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }

    next();
});

userSchema.methods.isValidPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    }catch(err) {
        throw err;
    }
}


const User = model('user', userSchema);



module.exports = User