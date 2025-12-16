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
  },
  { timestamps: { createdAt: true } }
);

module.exports = mongoose.model('User', UserSchema);