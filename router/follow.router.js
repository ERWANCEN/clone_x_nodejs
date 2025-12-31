const express = require('express');
const router = express.Router();

// IMPORTING THE CONTROLLER
const verifyToken = require('../middlewares/auth');
const FollowController = require('../controllers/follow.controller');

router.put('/follow/:id', verifyToken, FollowController.follow);
router.get('/following', verifyToken, FollowController.getFollowing);
router.get('/followers', verifyToken, FollowController.getFollowers);

module.exports = router;