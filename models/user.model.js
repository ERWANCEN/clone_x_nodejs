const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    pseudo: { 
      type: String, 
      required: true 
    },   
    name: { 
      type: String, 
      required: true 
    },
    lastname: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    password: { 
      type: String, 
      required: true 
    },
    stats: {
        followers: { type: Number, default: 0 }, // Followers
        following: { type: Number, default: 0 }  // The ones that I follow
    }
  },
  { timestamps: { createdAt: true } }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);