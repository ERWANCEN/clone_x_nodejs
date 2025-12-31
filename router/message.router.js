const express = require('express');
const router = express.Router();

// IMPORTING THE CONTROLLER
const verifyToken = require('../middlewares/auth');
const MessageController = require('../controllers/message.controller');

router.post('/', verifyToken, MessageController.sendingMessage);
router.put('/editMessage/:id', verifyToken, MessageController.editMessage);
router.delete('/deleteMessage/:id', verifyToken, MessageController.deleteMessage);

module.exports = router;