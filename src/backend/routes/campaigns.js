const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign } = require('../controllers/campaignsController');

router.get('/', getCampaigns);
router.post('/', createCampaign);  

module.exports = router;
