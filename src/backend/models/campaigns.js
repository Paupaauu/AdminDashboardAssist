// Define el esquema de la base de datos para las campañas
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
        type: String 
    }],

    language: {
        type: String, 
        required: true 
    },

    productive_hours_revenue: {
        type: Number, 
        required: false 
    },

    activities_Used:[{ 
        type: String 
    }]
});

module.exports = mongoose.model('campaigns', campaignsSchema);