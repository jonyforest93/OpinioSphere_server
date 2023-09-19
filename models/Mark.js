const {Schema, model} = require('mongoose');

const schema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    reviewId: {type: Schema.Types.ObjectId, ref: 'Review'},
    mark: {type: Number}
}, {
    timestamps: true
})

module.exports = model('Mark', schema);