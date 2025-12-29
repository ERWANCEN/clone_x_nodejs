const mongoose = require('mongoose');

const TweetSchema = mongoose.Schema(
  {
    author: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    text: { 
      type: String, 
      trim: true,
      maxLength: 280
    },   
    links: [
        {
            type: String
        }
    ],
    images: [
        {
            type: String
        }
    ],
    videos: [
        {
            type: String
        }
    ],
    likes: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    ],
    stats: {
        likes: { type: Number, default: 0 },
        retweets: { type: Number, default: 0 },
        comments: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

TweetSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.models.Tweet || mongoose.model('Tweet', TweetSchema);