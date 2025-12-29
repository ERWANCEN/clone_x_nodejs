const createError = require('../middlewares/error');
const ModelTweet = require('../models/tweet.model');
const ModelUser = require('../models/user.model');

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
            .populate('author', 'pseudo'); // Displays user information instead of just the ID

        res.status(200).json(tweets);
    } catch (error) {
        next(createError(500, "Unable to retrieve your Tweets", error.message));
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
            .populate('author', 'pseudo email'); // Display user's informations
        
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
        next(createError(500, "Unable to retrieve tweets from this user", error.message));
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

module.exports = {
    postTweet,
    editTweet,
    getMyTweets,
    getTweetsFromUser,
    deleteTweet
}