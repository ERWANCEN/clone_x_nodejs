const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema(
  {
    content: { 
      type: String, 
      required: true,
      trim: true
    },   
    sender: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);