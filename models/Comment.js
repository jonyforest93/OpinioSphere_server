const {Schema, model} = require('mongoose');

const schema = new Schema({
    text: {type: String},
    userName: {type: String},
    authorId: {type: Schema.Types.ObjectId, ref: 'User'},
    reviewId: {type: Schema.Types.ObjectId, ref: 'Review'}
}, {
    timestamps: true
})

module.exports = model('Comment', schema)