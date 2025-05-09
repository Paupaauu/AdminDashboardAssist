// Define el esquema de la base de datos para las campañas
const mongoose = require('mongoose');

const campaignsSchema = new mongoose.Schema({
    campaign_name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
     },

    client: { 
        type: String, 
        required: true,
        trim: true
    },

    marketUnit: { 
        type: String, 
        required: true,
        trim: true
    },

    language: {
        type: String, 
        required: true,
        trim: true
    },

    productive_hours_revenue: {
        type: Number, 
        required: false,
        trim: true
    },

});

module.exports = mongoose.model('campaigns', campaignsSchema);