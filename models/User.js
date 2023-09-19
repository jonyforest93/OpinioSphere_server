const {Schema, model} = require('mongoose');

const schema = new Schema({
    name: {type: String},
    email: {type: String, unique: true},
    password: {type: String},
    role: {type: String, default: 'User'},
    likesSum: {type: Number, default: 0}
}, {
    timestamps: true,
})

module.exports = model('User', schema);