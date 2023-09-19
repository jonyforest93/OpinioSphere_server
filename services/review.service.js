const Review = require('../models/Review');
const Tag = require('../models/Tag');
const User = require('../models/User')

class ReviewService {
    async markChecker() {

    }
    async likesChecker(likesArr, userId, reviewId, authorId, likesSum) {
        const result = likesArr.some(el => el === userId);
        const newLikesArr = [...likesArr];

        if (result) {
            const index = likesArr.indexOf(userId);
            newLikesArr.splice(index, 1);
            await User.updateOne(
                {_id: authorId},
                { $inc: { likesSum: -1 } }
            )
        } else {
            newLikesArr.push(userId);
            await User.updateOne(
                {_id: authorId},
                { $inc: { likesSum: +1 } }
            )
        }

        await Review.updateOne(
            {_id: reviewId},
            {$set: {likes: newLikesArr}}
        )

        return newLikesArr
    }

    async tagsCreated(tags) {
        async function isExistingTag(el) {
            const existingTag = await Tag.findOne({tag: el});
            return !!existingTag;
        }
        for (let i = 0; i < tags.length; i++) {
            if (!(await isExistingTag(tags[i]))) {
                await Tag.create({tag: tags[i]});
            }
        }
    }
}

module.exports = new ReviewService();