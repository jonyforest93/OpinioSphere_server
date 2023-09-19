const express = require('express');
const router = express.Router({mergeParams: true});
const User = require('../models/User');
const tokenService = require('../services/token.service');
const crypt = require('bcryptjs');

router.post('/signUp', async (req, res) => {
    try {
        const { email, password} = req.body;

        const existingUser = await User.findOne( { email: email });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email is exists. Please enter a different address ',
                code: 400
            })
        }

        const hashPassword = await crypt.hash(password, 12);

        const newUser = await User.create({
            ...req.body,
            password: hashPassword,
        })

        const tokens = tokenService.generate({ _id: newUser._id})
        await tokenService.save(newUser._id, tokens.refreshToken)

        res.status(201).send({...tokens, user : {userId: newUser._id, userName: newUser.name, userEmail: newUser.email}});

    } catch (e) {
        res.status(500).json({
            message: e.message
        })
    }
});

router.post('/signInWithPassword', async (req, res) => {
    try {
        const {email, password} = req.body;

        const existingUser = await User.findOne( { email: email });

        if (!existingUser) {
            return res.status(400).send({
                error: {
                    message: 'Email not found',
                    code: 400
                }
            })
        }

        const isPasswordEqual = await crypt.compare(password, existingUser.password)

        if (!isPasswordEqual) {
            return res.status(400).send({
                error: {
                    message: 'Invalid password',
                    code: 400
                }
            })
        }

        const tokens = tokenService.generate( { _id: existingUser._id });
        await tokenService.save(existingUser._id, tokens.refreshToken);

        res.status(201).send({...tokens, user : {userId: existingUser._id, userName: existingUser.name, userEmail: existingUser.email}});

    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка'
        })
    }
});

function isTokenInvalid(data, dbToken) {
    return (!data || !dbToken || data._id !== dbToken?.user?.toString())
}

router.post('/token', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const data = tokenService.validateRefresh(refreshToken);
        const dbToken = await tokenService.findToken(refreshToken);

        if (isTokenInvalid(data, dbToken)) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const tokens = await tokenService.generate({_id: data._id});
        await tokenService.save(data._id, tokens.refreshToken);

        res.status(200).send({ ...tokens, userId: data._id  });

    } catch (e) {
        res.status(500).json({
            message: 'На сервере произошла ошибка'
        })
    }
});

module.exports = router