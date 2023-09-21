const express = require('express');
const router = express.Router({mergeParams: true});
const Comment = require('../models/Comment');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware')

router.post('/create', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { reviewId, text } = req.body;

        const user = await User.findOne({_id: userId});

        const newComment = await Comment.create({
            text: text,
            userName: user.name,
            authorId: userId,
            reviewId: reviewId
        })

        res.status(201).json({
            userName: user.name,
            text: text,
            timeCreated: newComment.createdAt
        })
    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка'
        })
    }
})

router.get('/review/:id', async (req, res) => {
    try {
        const reviewId = req.params.id;

        const comments = await Comment.find({reviewId: reviewId})

        res.status(200).json(comments);
    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка'
        })
    }
})

module.exports = router