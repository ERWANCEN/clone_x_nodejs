const express = require('express');
const router = express.Router();

// IMPORTING THE CONTROLLER
const TweetController = require('../controllers/tweet.controller');
const verifyToken = require('../middlewares/auth');

router.post('/post', verifyToken, TweetController.postTweet);
router.put('/edit/:id', verifyToken, TweetController.editTweet);
router.get('/myTweets', verifyToken, TweetController.getMyTweets);
router.get('/fromUser/:id', verifyToken, TweetController.getTweetsFromUser);
router.delete('/delete/:id', verifyToken, TweetController.deleteTweet);
router.put('/like/:id', verifyToken, TweetController.likeTweet);
router.post('/comment/:id', verifyToken, TweetController.postComment);
router.get('/comments/:id', verifyToken, TweetController.getCommentsByTweet);
router.put('/editComment/:id', verifyToken, TweetController.editComment);
router.delete('/deleteComment/:id', verifyToken, TweetController.deleteComment);

module.exports = router;