const jwt = require('jsonwebtoken');
const config = require('config');
const Token = require('../models/Token');

class TokenService {
    generate(payload) {
        const accessToken = jwt.sign(payload, config.get('accessSecret'), {
            expiresIn: '24h',
        });
        const refreshToken = jwt.sign(payload, config.get('refreshSecret'));
        return {
            accessToken, refreshToken, expiresIn: 86400
        }
    }

    async save(userId, refreshToken) {
        const data = await Token.findOne({user: userId});

        if (data) {
            data.refreshToken = refreshToken;
            return data.save();
        }

        const token = await Token.create({user: userId, refreshToken: refreshToken});
        return token
    }

    validateRefresh(refreshToken) {
        return jwt.verify(refreshToken, config.get('refreshSecret'))
    }

    validateAccess(accessToken) {
        return jwt.verify(accessToken, config.get('accessSecret'))
    }

    async findToken(refreshToken) {
        try {
            return await Token.findOne( {refreshToken} )
        } catch (e) {
            return null
        }
    }

}

module.exports = new TokenService();