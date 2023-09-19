const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../models/User');
const auth = require('../middleware/auth.middleware')

router.get('/all', auth, async (req, res) => {
    try {
        const usersData = await User.find();
        res.status(200).send(usersData)
    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка'
        })
    }
});

router.get('/id/:id', auth, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({_id: userId});
        res.status(200).json(user);

    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка'
        })
    }
})

module.exports = router