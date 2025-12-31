const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema(
  {
    author: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    tweetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
        required: true
    },
    text: { 
      type: String, 
      required: true,
      trim: true,
      maxLength: 280
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Comment', // Reference to this same model
        default: null // Null if it is a normal comment
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);