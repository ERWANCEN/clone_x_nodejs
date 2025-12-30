const createError = require('../middlewares/error');
const ModelTweet = require('../models/tweet.model');
const ModelUser = require('../models/user.model');
const ModelFollow = require('../models/follow.model');

// Create a Tweet
const postTweet = async (req, res, next) => {
    try {
        // Author retrieval
        const authorId = req.auth.id; 

        // Body data recovery 
        const { text, links, images, videos } = req.body;

        // Is the Tweet empty?
        const hasText = text && text.trim().length > 0;
        const hasLink = links && links.length > 0;
        const hasMedia = (images && images.length > 0) || (videos && videos.length > 0);

        if (!hasText && !hasLink && !hasMedia) {
            // If everything is empty
            return next(createError(400, "A Tweet must contain at least text, link or media"));
        }

        // Tweet creation
        const newTweet = await ModelTweet.create({
            author: authorId,
            text,
            links,
            images, 
            videos
        });

        res.status(201).json(newTweet);
    } catch (error) {
        next(createError(error.status || 500, "You cannot Tweet", error.message));
    }
}

// Edit a Tweet
const editTweet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = req.auth.id;
        const { text, links, images, videos } = req.body;

        // We are looking for the Tweet
        const tweetToUpdate = await ModelTweet.findById(id);

        if (!tweetToUpdate) {
            return next(createError(404, "Tweet not found"));
        }

        // Is it MY Tweet?
        if (tweetToUpdate.author.toString() !== currentUserId) {
            return next(createError(403, "You can only edit your own Tweets"));
        }

        // Update fields
        if (text !== undefined) tweetToUpdate.text = text;
        if (links !== undefined) tweetToUpdate.links = links;
        if (images !== undefined) tweetToUpdate.images = images;
        if (videos !== undefined) tweetToUpdate.videos = videos;

        // Is the Tweet empty?
        const hasText = tweetToUpdate.text && tweetToUpdate.text.trim().length > 0;
        const hasLink = tweetToUpdate.links && tweetToUpdate.links.length > 0;
        const hasMedia = (tweetToUpdate.images && tweetToUpdate.images.length > 0) || (tweetToUpdate.videos && tweetToUpdate.videos.length > 0);

        if (!hasText && !hasLink && !hasMedia) {
             return next(createError(400, "The Tweet cannot be empty after editing"));
        }

        // Save
        const updatedTweet = await tweetToUpdate.save();
        res.status(200).json(updatedTweet);

    } catch (error) {
        next(createError(error.status || 500, "Failed to edit the Tweet", error.message));
    }
}

// Get only MY Tweets
const getMyTweets = async (req, res, next) => {
    try {
        const currentUserId = req.auth.id;

        const tweets = await ModelTweet.find({ author: currentUserId })
            .sort({ createdAt: -1 }) // Newest first
            .populate('author', 'pseudo') // Displays user information instead of just the id

            // If it's a retweet, fill in the information from the original tweet AND its author
            .populate({
                path: 'retweetedTweet', 
                populate: { path: 'author', select: 'pseudo' }
            });

        res.status(200).json(tweets);
    } catch (error) {
        next(createError(error.status || 500, "Unable to retrieve your Tweets", error.message));
    }
}

// Get Tweets from a specific user
const getTweetsFromUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log("--- DEBUG START ---");
        console.log("1. ID recherché (depuis URL) :", id);

        // Does the user exist?
        const userExists = await ModelUser.exists({ _id: id });

        if (!userExists) {
            return next(createError(404, "User not found"));
        }

        // We are looking for the Tweets that have author == id
        const tweets = await ModelTweet.find({ author: id })
            .sort({ createdAt: -1 })
            .populate('author', 'pseudo email') // Display user's informations

            // If it's a retweet, fill in the information from the original tweet AND its author
            .populate({
                path: 'retweetedTweet', 
                populate: { path: 'author', select: 'pseudo' }
            });
        
        console.log("2. Nombre de tweets trouvés :", tweets.length);
        if (tweets.length > 0) {
            console.log("3. Exemple d'auteur du premier tweet trouvé :", tweets[0].author);
        }
        console.log("--- DEBUG END ---");

        // Does the user have any Tweets?
        if (!tweets || tweets.length === 0) {
            return res.status(200).json({ 
                message: "This user didn't post any Tweet yet" 
            });
        }

        res.status(200).json(tweets);
    } catch (error) {
        next(createError(error.status || 500, "Unable to retrieve tweets from this user", error.message));
    }
}

// Deleting one of my Tweet
const deleteTweet = async (req, res, next) => {
    try {
        const { id } = req.params; // Tweet id
        const currentUserId = req.auth.id; // Id of the user that wants to delete a Tweet

        // We are looking for the Tweet
        const tweetToDelete = await ModelTweet.findById(id);

        // Does the Tweet exist?
        if (!tweetToDelete) {
            return next(createError(404, "Tweet not found"));
        }

        // Am I the author of the Tweet?
        if (tweetToDelete.author.toString() !== currentUserId) {
            return next(createError(403, "You can only delete one of your own Tweet"));
        }

        // Deletion
        await tweetToDelete.deleteOne();

        res.status(200).json({ message: "Tweet deleted" });
    } catch (error) {
        next(createError(error.status || 500, "Unable to delete this Tweet", error.message));
    }
}

// Like or Unlike a tweet
const likeTweet = async (req, res, next) => {
    try {
        const { id } = req.params; // Tweet's id
        const userId = req.auth.id; // Id of the person who's liking
        console.log(id);
        console.log(userId);
        

        // We retrieve the tweet
        const tweet = await ModelTweet.findById(id);

        if (!tweet) {
            return next(createError(404, "Tweet not found"));
        }

        // Has the user already liked it?
        const isLiked = tweet.likes.includes(userId);

        if (isLiked) {
            // 1. Yes, the user already liked, so we remove it
            // The ID is removed from the table
            tweet.likes = tweet.likes.filter(id => id.toString() !== userId);
            
            // The counter is decremented (without going below 0)
            tweet.stats.likes = Math.max(0, tweet.stats.likes - 1);
            
            await tweet.save();
            res.status(200).json({ message: "Tweet unliked", stats: tweet.stats });
        } else {
            // 2. No, the user didn't like the Tweet yet
            
            // We're adding the id in the table
            tweet.likes.push(userId);
            
            // We increment the counter
            tweet.stats.likes += 1;
            
            await tweet.save();
            res.status(200).json({ message: "Tweet liked", stats: tweet.stats });
        }

    } catch (error) {
        next(createError(error.status || 500, "Unable to like the tweet", error.message));
    }
}

// Adding a comment to a Tweet
const postComment = async (req, res, next) => {
    try {
        const { id } = req.params; // Id of the Tweet to comment
        const authorId = req.auth.id; 
        const { text } = req.body;

        if (!text) return next(createError(400, "The comment cannot be empty"));

        // Does the Tweet exist?
        const tweet = await ModelTweet.findById(id);
        if (!tweet) return next(createError(404, "Tweet not found"));

        // Creating the comment
        const newComment = await ModelComment.create({
            author: authorId,
            tweetId: id,
            text
        });

        // Update the comment counter
        tweet.stats.comments += 1;
        await tweet.save();

        // Return author information
        await newComment.populate('author', 'pseudo avatar');

        res.status(201).json(newComment);
    } catch (error) {
        next(createError(error.status || 500, "Unable to comment", error.message));
    }
}

// Read comments on a tweet
const getCommentsByTweet = async (req, res, next) => {
    try {
        const { id } = req.params; // Tweet's id

        // We are looking for all comments that have this tweetId
        const comments = await ModelComment.find({ tweetId: id })
            .sort({ createdAt: -1 }) // Newest first
            .populate('author', 'pseudo');

        res.status(200).json(comments);
    } catch (error) {
        next(createError(error.status || 500, "Unable to retrieve comments", error.message));
    }
}

// Edit a comment
const editComment = async (req, res, next) => {
    try {
        const { id } = req.params; // Comment's id
        const userId = req.auth.id; // Token user id
        const { text } = req.body; // New text

        // Check that the text is not empty
        if (!text || text.trim().length === 0) {
            return next(createError(400, "The comment cannot be empty"));
        }

        // Search for the comment 
        const commentToUpdate = await ModelComment.findById(id);

        if (!commentToUpdate) {
            return next(createError(404, "Comment not found"));
        }

        // Is it MY comment?
        if (commentToUpdate.author.toString() !== userId) {
            return next(createError(403, "You can only edit your own comments"));
        }

        // Update and save
        commentToUpdate.text = text;
        const updatedComment = await commentToUpdate.save();

        res.status(200).json(updatedComment);
    } catch (error) {
        next(createError(error.status || 500, "Unable to edit the comment", error.message));
    }
}

// Delete a comment
const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params; // Comment id
        const userId = req.auth.id; // Token user id

        // Search for the comment
        const commentToDelete = await ModelComment.findById(id);

        if (!commentToDelete) {
            return next(createError(404, "Comment not found"));
        }

        // Is it MY comment?
        if (commentToDelete.author.toString() !== userId) {
            return next(createError(403, "You can only delete your own comments"));
        }

        // Update the parent Tweet's counter
        const relatedTweet = await ModelTweet.findById(commentToDelete.tweetId);
        
        if (relatedTweet) {
            // We decrement the counter (making sure it does not go negative)
            relatedTweet.stats.comments = Math.max(0, relatedTweet.stats.comments - 1);
            await relatedTweet.save();
        }

        // Delete the comment
        await commentToDelete.deleteOne();

        res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        next(createError(error.status || 500, "Unable to delete the comment", error.message));
    }
}

// Retweet or Cancel retweet
const retweet = async (req, res, next) => {
    try {
        const { id } = req.params; // The id of the original tweet
        const userId = req.auth.id; // Me

        // Check if the original tweet exists
        const originalTweet = await ModelTweet.findById(id);
        if (!originalTweet) return next(createError(404, "Original tweet not found"));

        // Have I already retweeted this tweet?
        const existingRetweet = await ModelTweet.findOne({
            author: userId,
            retweetedTweet: id
        });

        if (existingRetweet) {
            // 1. Undo retweet
            
            // The retweeted tweet is deleted
            await existingRetweet.deleteOne();

            // The counter for the original tweet is decremented
            await ModelTweet.findByIdAndUpdate(id, { $inc: { 'stats.retweets': -1 } });

            res.status(200).json({ message: "Retweet canceled" });

        } else {
            // 2. Create retweet
            
            // We create a new empty tweet, but with the reference
            await ModelTweet.create({
                author: userId,
                retweetedTweet: id
            });

            // We increment the counter of the original tweet
            await ModelTweet.findByIdAndUpdate(id, { $inc: { 'stats.retweets': 1 } });

            res.status(201).json({ message: "Retweet successfully completed" });
        }
    } catch (error) {
        next(createError(error.status || 500, "Unable to manage retweets", error.message));
    }
}

// Retrieve the feed with the Tweets of the people I'm following 
const getFeed = async (req, res, next) => {
    try {
        const userId = req.auth.id;

        // Retrieve the ids of the people I follow
        const followingDocs = await ModelFollow.find({ follower: userId });
        
        // We just extract the ids of the ‘following’ field, to create a table
        const followingIds = followingDocs.map(doc => doc.following);

        // Retrieve tweets whose author is IN ($in) this list
        const tweets = await ModelTweet.find({ 
            author: { $in: followingIds } 
        })
        .sort({ createdAt: -1 }) // From newest to oldest
        .populate('author', 'pseudo') // Author's info
        .populate({ // Information from the original tweet if it's a retweet
            path: 'retweetedTweet', 
            populate: { path: 'author', select: 'pseudo' }
        });

        res.status(200).json(tweets);
    } catch (error) {
        next(createError(error.status || 500, "Unable to load the feed", error.message));
    }
}

module.exports = {
    postTweet,
    editTweet,
    getMyTweets,
    getTweetsFromUser,
    deleteTweet,
    likeTweet,
    postComment,
    getCommentsByTweet,
    editComment,
    deleteComment,
    retweet,
    getFeed
}