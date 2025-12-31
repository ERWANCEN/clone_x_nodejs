// Will contain all extensions and routers
const express = require('express');
const connectDB = require('./config/db_mongo');
const cookieParser = require('cookie-parser');

require('dotenv').config();
connectDB();

const ENV = require('./config/env');
const app = express();

// IMPORTS ROUTES
const userRouter = require('./router/user.router');
const messageRouter = require('./router/message.router');
const tweetRouter = require('./router/tweet.router');
const followRouter = require('./router/follow.router');
const searchRouter = require('./router/search.router');

// MIDDLEWARES
app.use(cookieParser());
app.use(express.json());

// PREFIX
app.use('/api/user', userRouter);
app.use('/api/message', messageRouter);
app.use('/api/tweet', tweetRouter);
app.use('/api/follow', followRouter);
app.use('/api/search', searchRouter);

// ERROR MANAGEMENT MIDDLEWARE
app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "Une erreur est survenue.";
    const detail = error.details || "null";

    res.status(status).json({
        error: {
            status,
            message,
            detail
        }
    })
})

module.exports = app;