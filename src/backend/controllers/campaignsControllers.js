const Campaign = require('../models/campaigns');
const Site = require('../models/sites');

const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate('site');
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Error getting campaigns' });
    }
};

const createCampaign = async (req, res) => {
    try {
        const newCampaign = new Campaign(req.body);
        await newCampaign.save();
        res.status(201).json(newCampaign);
    } catch (error) {
        res.status(400).json({ message: 'Error creating campaign' });
    }
};

module.exports = { getCampaigns, createCampaign };
