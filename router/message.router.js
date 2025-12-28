const express = require('express');
const router = express.Router();

// IMPORTING THE CONTROLLER
const MessageController = require('../controllers/message.controller');
const verifyToken = require('../middlewares/auth');

router.post('/', verifyToken, MessageController.sendingMessage);
router.put('/editMessage/:id', verifyToken, MessageController.editMessage);
router.delete('/deleteMessage/:id', verifyToken, MessageController.deleteMessage);

module.exports = router;