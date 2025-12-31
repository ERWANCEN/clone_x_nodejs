const express = require('express');
const router = express.Router();

// IMPORTING THE CONTROLLER
const verifyToken = require('../middlewares/auth');
const MessageController = require('../controllers/message.controller');

router.post('/send', verifyToken, MessageController.sendingMessage);
router.get('/received', verifyToken, MessageController.receivedMessages);
router.get('/sent', verifyToken, MessageController.sentMessages);
router.get('/conversation/:id', verifyToken, MessageController.privateConversation);
router.put('/editMessage/:id', verifyToken, MessageController.editMessage);
router.delete('/deleteMessage/:id', verifyToken, MessageController.deleteMessage);

module.exports = router;