const express = require('express');
const router = express.Router();

// IMPORTING THE CONTROLLER
const verifyToken = require('../middlewares/auth');
const SearchController = require('../controllers/search.controller');

// GET http://localhost:PORT/api/search?q=motcle
router.get('/', verifyToken, SearchController.search);

module.exports = router;