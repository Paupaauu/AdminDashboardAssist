//Define el esquema de la base de datos para los documents de campañas

const mongoose = require('mongoose');

const campaignsSchema = new mongoose.Schema({
    campaign_name: { 
        type: String, 
        required: true, 
        unique: true
     },

    client: { 
        type: String, 
        required: true 
    },

    marketUnit: { 
        type: String, 
        required: true 
    },
    
    sites: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'site' }],

    language: {
        type: String, 
        required: true 
    },

    productive_hours_revenue: {
        type: Number, 
        required: false 
    },

    activities_Used: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activities' }]
});

module.exports = mongoose.model('campaigns', campaignsSchema);
