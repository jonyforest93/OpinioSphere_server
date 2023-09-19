const {Schema, model} = require('mongoose');

const schema = new Schema({
    tag: {type: String}
}, {
    timestamps: true
})

module.exports = model('Tag', schema)