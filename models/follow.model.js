const mongoose = require('mongoose');

const FollowSchema = mongoose.Schema(
  {
    follower: { // The one that "follows"
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    following: { // The one that is being "followed"
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
  },
  { timestamps: true }
);

// Prevents the same person from being followed twice
// If “follower” and “following” are identical, the database blocks
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.models.Follow || mongoose.model('Follow', FollowSchema);