// Define el esquema de la base de datos para los documentos de actividades
const mongoose = require('mongoose');

const activitiesSchema = new mongoose.Schema({
  activity_name: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: false 
  }
});

module.exports = mongoose.model('activities', activitiesSchema);