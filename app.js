// Va contenir toutes les extensions et routers
const express = require('express');
const connectDB = require('./config/db_mongo');
const ENV = require('./config/env');
const app = express();

// IMPORTS ROUTES


// CONNEXION MONGO
connectDB(ENV.MONGO_URI_LOCAL, ENV.DB_NAME);

// MIDDLEWARES
app.use(express.json());

// PREFIX


// MIDDLEWARE DE GESTION D'ERREURS
app.use((error, req, res, next) => {
    const status = error.status || 500;

    res.status(status).json({
        error: {
            status,
            message,
            detail
        }
    })
})

module.exports = app;