const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../models/User');
const Mark = require('../models/Mark');
const auth = require('../middleware/auth.middleware');

router.get('/:id/getMark', auth, async(req, res) => {
    try {

    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка'
        })
    }
})

module.exports = router