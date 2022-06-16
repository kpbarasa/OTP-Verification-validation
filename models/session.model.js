const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  sessionID: {
    type: String,
    required: true, 
    trim: true,
    minlength: 3
  },
  session_user: {
    type: String,
    required: true,
    minlength: 3
  },
  session_start: {
    type: Date,
    required: true,  
    minlength: 3
  },
  session_end: {
    type: Date,
    required: true, 
    minlength: 3
  },
  secret: {
    type: String,  
    minlength: 3
  },
  token: {
    type: String,  
    minlength: 3
  },
  session_status: {
    type: String, 
    required: true, 
    minlength: 3
  }
}, {
  timestamps: true,
});

const userSessions = mongoose.model('userSessions', sessionSchema);

module.exports = userSessions;