const mongoose = require('mongoose');
const bcrypt = require('brcyptjs');
const { type } = require('express/lib/response');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,   
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// The hash password before saving.
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { return next(); }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});
// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);