const mongoose = require('mongoose');

const workersSchema = new mongoose.Schema({
  useremail: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },


});

module.exports = mongoose.model('users', workersSchema);
