const express = require('express');
const router = express.Router({mergeParams: true});
const Review = require('../models/Review');
const User = require('../models/User');
const Mark = require('../models/Mark');
const Tag = require('../models/Tag');
const reviewService = require('../services/review.service');
const auth = require('../middleware/auth.middleware');
const { ref, uploadBytes, getStorage, getDownloadURL} = require('@firebase/storage');
const firebaseStorage = require("../firebase.config");
const { Guid } = require('js-guid');
const tokenServices = require("../services/token.service");
const mongoose = require("mongoose");


router.post('/create', auth,async (req, res) => {
    try {
        const { tags } = req.body;

        const filename = Guid.newGuid().toString() + req.body.filename;
        const image = req.body.image.slice(req.body.image.indexOf(',') + 1);
        const buffer = Uint8Array.from(atob(image), c => c.charCodeAt(0))

        const storageRef = ref(firebaseStorage, filename);
        uploadBytes(storageRef, buffer, { contentType: 'image/jpg'}).then(async (snapshot) => {
            await reviewService.tagsCreated(tags);
            getDownloadURL(storageRef).then(async (result) => {
                const newReview = await Review.create({ ...req.body, authorId: req.user._id, image: result});
                res.status(201).json(newReview);
            })
        }).catch((error) => {
            console.error('Error uploading file:', error);
        });


    } catch (e) {
        res.status(500).json({
            message: `На сервере произошла ошибка 1 ${e}`
        })
    }
})

router.post('/all', async (req, res) => {
    try {
        const {category, sort} = req.body;

        const sortObject = {};
        sortObject[sort] = -1;

        const aggregationPipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            {
                $unwind: '$authorInfo'
            },
            {
                $addFields: {
                    authorName: '$authorInfo.name',
                    authorLikeSum: '$authorInfo.likesSum',
                    rateAverage: { $divide: ["$review.rateSum", "$review.rateCount"] },
                }
            },
            {
                $sort : sortObject,
            }
        ];

        if (category !== "All") {
            aggregationPipeline.unshift({
                $match: { category: category },
            });
        }

        const reviews = await Review.aggregate(aggregationPipeline);

        res.status(200).json(reviews);
    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка 2'
        })
    }
})

router.get('/user/:id', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id);

        const aggregationPipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo',
                },
            },
            {
                $unwind: '$authorInfo',
            },
            {
                $addFields: {
                    authorName: '$authorInfo.name',
                },
            },
            {
                $match: {
                    authorId: userId
                }
            }
        ]

        const reviews = await Review.aggregate(aggregationPipeline)

        res.status(201).json(reviews);
    } catch (e) {
        res.status(500).json({
            message: e.message
        })
    }

})

router.get('/id/:id', async (req, res) => {
    try {
        const reviewId = req.params.id;

        let isLiked = false;
        let isMarked = false;
        let userMark = 'You dont marked this review'
        const token = req.headers.authorization?.split(' ')[1];

        const review = await Review.findOne( { _id: reviewId } );
        const user = await User.findOne( {_id: review.authorId});

        if (token) {
            const data = tokenServices.validateAccess(token);
            const mark = await Mark.findOne( {userId: data._id, reviewId: reviewId} )
            if (mark) {
                isMarked = true;
                userMark = `Your mark is ${mark.mark}`;
            }
            const result = review.likes.some(el => el === data._id);
            isLiked = !!result;
        }

        const resultReview = {
            category: review.category,
            name: review.name,
            subject: review.subject,
            description: review.description,
            image: review.image,
            tags: review.tags,
            mark: review.mark,
            likes: review.likes.length,
            isLiked: isLiked,
            isMarked: isMarked,
            userMark: userMark,
            rateSum: review.rateSum,
            rateCount: review.rateCount,
            craetedDate: review.createdAt,
        }

        res.status(200).json({review: resultReview, author: user });

    } catch (e) {
        res.status(500).json({
            message: e.message,
        })
    }
})

router.patch('/edit/:id', auth, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const updates = req.body;
        const updatedReview = await Review.findByIdAndUpdate(reviewId, updates, {new: true});
        res.status(201).json(updatedReview)
    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка 4'
        })
    }
})

router.delete('/delete', auth, async (req, res) => {
    try {
        const reviewId = req.query.id;
        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return res.status(404).json({ message: 'Обзор не найден' });
        }

        res.status(200).json({ message: `Обзор c ID: ${reviewId} успешно удален` });
    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка 5'
        })
    }
})

router.post('/:id/like', auth,async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user._id;

        const review = await Review.findOne( { _id: reviewId } );
        const author = await User.findOne( {_id: review.authorId});

        const newLikesArr = await reviewService.likesChecker(review.likes, userId, review._id, author._id, author.likesSum);

        res.status(201).json({
            likes: newLikesArr.length
        });
    } catch (e) {
        res.status(500).json({
            message: 'Only for authorized users'
        })
    }
})

router.patch('/:id/setMark', auth, async(req, res) => {
    try {
        const {mark, reviewId} = req.body;

        const userId = req.user._id;
        const review = await Review.findOne({_id: reviewId});

        const existingMark = await Mark.findOne({userId: userId, reviewId: reviewId});

        if (existingMark) {
            review.rateSum = review.rateSum - existingMark.mark + parseInt(mark);
            existingMark.mark = mark;
            await existingMark.save();
        } else {
            review.rateSum = review.rateSum + parseInt(mark);
            review.rateCount = review.rateCount + 1;
            await Mark.create({userId: userId, reviewId: reviewId, mark: mark})
        }

        await review.save();

        res.status(201).json(mark);
    } catch (e) {
        res.status(500).json({
            message: e.message,
        })
    }
});

router.post('/search', async(req, res) => {
    try {

    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка'
        })
    }
})

router.post('/tags', async(req, res) => {
    try {
        const {text} = req.body;
        console.log(text)

        const tags = await Tag.find({ tag: { $regex: new RegExp(text, 'i') } }).limit(5);

        res.status(201).json(tags);
    } catch (e) {
        res.status(500).json({
            message: e.message,
        })
    }
})

module.exports = router