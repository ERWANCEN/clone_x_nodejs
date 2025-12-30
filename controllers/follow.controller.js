const createError = require('../middlewares/error');
const ModelFollow = require('../models/follow.model');
const ModelUser = require('../models/user.model');

// Toggle Follow (Follow / Unfollow)
const follow = async (req, res, next) => {
    try {
        const followerId = req.auth.id; // Me
        const targetId = req.params.id; // The one that I want to follow

        if (followerId === targetId) {
            return next(createError(400, "You cannot follow yourself"));
        }

        // Check if the user exists
        const targetUserExists = await ModelUser.exists({ _id: targetId });
        if (!targetUserExists) return next(createError(404, "User not found"));

        // Check if the relation already exists
        const existingFollow = await ModelFollow.findOne({ 
            follower: followerId, 
            following: targetId 
        });

        if (existingFollow) {
            // 1. Unfollow
            
            // Delete the relation
            await existingFollow.deleteOne();
            
            // Updating counters (-1)
            // Me: I follow one person less
            await ModelUser.findByIdAndUpdate(followerId, { 
                $inc: { 'stats.following': -1 } 
            });
            // The other: He has one less subscriber.
            await ModelUser.findByIdAndUpdate(targetId, { 
                $inc: { 'stats.followers': -1 } 
            });
            
            res.status(200).json({ message: "Unfollow successful" });

        } else {
            // 2. Follow
            
            // Create a relation
            await ModelFollow.create({
                follower: followerId,
                following: targetId
            });

            // Updating counters (+1)
            // Me: I follow one more person
            await ModelUser.findByIdAndUpdate(followerId, { 
                $inc: { 'stats.following': 1 } 
            });
            // The other: He has one more subscriber
            await ModelUser.findByIdAndUpdate(targetId, { 
                $inc: { 'stats.followers': 1 } 
            });

            res.status(200).json({ message: "Follow successful" });
        }
    } catch (error) {
        next(createError(error.status || 500, "Error during follow/unfollow", error.message));
    }
}

// See my followings
const getFollowing = async (req, res, next) => {
    try {
        const userId = req.auth.id;
        
        // We search the Follow table for all documents where “follower” is ME.
        const followingList = await ModelFollow.find({ follower: userId })
            .populate('following', 'pseudo email');

        res.status(200).json(followingList);
    } catch (error) {
        next(createError(error.status || 500, "Unable to retrieve your subscriptions", error.message));
    }
}

// See my followers
const getFollowers = async (req, res, next) => {
    try {
        const userId = req.auth.id;

        // We are looking for all documents where “following” is ME.
        const followersList = await ModelFollow.find({ following: userId })
            .populate('follower', 'pseudo email');

        res.status(200).json(followersList);
    } catch (error) {
        next(createError(error.status || 500, "Unable to retrieve your subscribers", error.message));
    }
}

module.exports = {
    follow,
    getFollowing,
    getFollowers
}