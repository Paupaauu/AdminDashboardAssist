const mongoose = require('mongoose');

const campaignsSchema = new mongoose.Schema({
    campaing: { type: String, required: true, unique: true },
    client: { type: String, required: true },
    mongoosearketUnit: { type: String, required: true },
    site: [{ type: mongoose.Schema.Types.ObjectId, ref: 'site' }],
    language: [String],
    invoicing_Type: [String],
    activities_Used: [String]
});

module.exports = mongoose.model('campaigns', campaignsSchema);
