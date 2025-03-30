const Site = require('../models/sites');

const getSites = async (req, res) => {
    try {
        const sites = await Site.find();
        res.json(sites);
    } catch (error) {
        res.status(500).json({ message: 'Error getting sites' });
    }
};

const createSite = async (req, res) => {
    try {
        const nuevoSite = new Site(req.body);
        await nuevoSite.save();
        res.status(201).json(nuevoSite);
    } catch (error) {
        res.status(400).json({ message: 'Error creating site' });
    }
};

module.exports = { getSites, createSite };
