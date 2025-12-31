const jwt = require('jsonwebtoken');
const createError = require('./error');
const ENV = require('../config/env');

const verifyToken = (req, res, next) => {
    // Retrieves the JWT JSON (token) from cookies
    const token = req.cookies.access_token;

    if (!token) return next(createError(401, "Access Denied"));

    // Verifies the validity of the token using jwt.verify
    jwt.verify(token, ENV.TOKEN, (err, user) => {
        if(err) return next(createError(403, "Invalid token"));

        /* 
            If the verification is successful, the user's information is added to the “req.auth” object.
        */
        req.auth = user;

        next();
    })
}

module.exports = verifyToken;