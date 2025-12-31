const express = require('express');
const router = express.Router();

// IMPORTING THE CONTROLLER
const verifyToken = require('../middlewares/auth');
const MessageController = require('../controllers/message.controller');

router.post('/send', verifyToken, MessageController.sendingMessage);
router.get('/received', verifyToken, messageController.receivedMessages);
router.get('/sent', verifyToken, messageController.sentMessages);
router.get('/conversation/:id', verifyToken, messageController.privateConversation);
router.put('/editMessage/:id', verifyToken, MessageController.editMessage);
router.delete('/deleteMessage/:id', verifyToken, MessageController.deleteMessage);

module.exports = router;