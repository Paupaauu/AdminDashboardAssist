const mongoose = require('mongoose');

const workersSchema = new mongoose.Schema({
  agent_id: { 
    type: String, 
    required: true,
    unique: true    
  },
  agent_name: { 
    type: String, 
    required: true 
  },
  agent_surname1: { 
    type: String, 
    required: true 
  },
  agent_surname2: {
    type: String, 
    required: true 
  },
  site: {
    type: String, 
    required: true 
  },
  activity: {
    type: String, 
    required: true 
  },
  campaign: {
    type: String, 
    required: true 
  },
  hours_worked: {
    type: Number, 
    required: true 
  },
});

module.exports = mongoose.model('workers', workersSchema);