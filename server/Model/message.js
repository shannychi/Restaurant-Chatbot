const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
  message: String,
  user: String,
  createdAt: {type: Date, default: Date.now}
})

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;