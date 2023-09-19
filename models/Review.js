const {Schema, model} = require('mongoose');

const schema = new Schema({
    category: {type: String},
    name: {type: String},
    subject: {type: String},
    description: {type: String},
    image: {type: String},
    tags: {type: Array},
    mark: {type: Number},
    likes: {type: Array, default: []},
    rateSum: {type: Number, default: 0},
    rateCount: {type: Number, default: 0},
    authorId: {type: Schema.Types.ObjectId, ref: 'User'},
}, {
        timestamps: true
})

module.exports = model('Review', schema)