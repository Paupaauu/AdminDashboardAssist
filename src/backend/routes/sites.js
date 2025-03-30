const express = require('express');
const router = express.Router();
const { getSites, createSite } = require('../controllers/sitesController');

router.get('/', getSites);
router.post('/', createSite);

module.exports = router;