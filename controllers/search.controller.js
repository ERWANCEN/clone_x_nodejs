const ModelUser = require('../models/user.model');
const ModelTweet = require('../models/tweet.model');
const createError = require('../middlewares/error');

const search = async (req, res, next) => {
    try {
        // We retrieve the keyword from the URL
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return next(createError(400, "The search term cannot be empty"));
        }

        // Creating the Regex (Regular Expression)
        // ‘i’ = case insensitive (finds “Test” even if you search for “test”)
        const regex = new RegExp(q, 'i');

        // Search in users
        // Search in the username OR ($or) in the last name OR in the first name
        const users = await ModelUser.find({
            $or: [
                { pseudo: regex },
                { name: regex },
                { lastname: regex }
            ]
        }).select('pseudo name lastname'); // Only the essential information is returned

        // Searching in Tweets
        // Searching within the text of the tweet
        const tweets = await ModelTweet.find({
            text: regex
        })
        .populate('author', 'pseudo') // We want to know who wrote it.
        .sort({ createdAt: -1 }); // Most recent first

        // Grouped response
        res.status(200).json({
            users: users,
            tweets: tweets,
            count: {
                users: users.length,
                tweets: tweets.length
            }
        });
    } catch (error) {
        next(createError(error.status || 500, "Error during search", error.message));
    }
}

module.exports = {
    search
};