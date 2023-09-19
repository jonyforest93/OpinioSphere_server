const tokenServices = require('../services/token.service')

module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({message: 'Only for authorized users'})
        }

        const data = tokenServices.validateAccess(token);
        req.user = data;
        next();
    } catch (e) {
        res.status(401).json({message: 'Only for authorized users'})
    }

}