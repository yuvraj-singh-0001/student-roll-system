const express = require('express');
const logSocial = require('../../api/activity/logSocial');
const logWebsite = require('../../api/activity/logWebsite');
const getSummary = require('../../api/activity/getSummary');

const router = express.Router();

// POST /activity/social  -> log social media usage
router.post('/social', logSocial);

// POST /activity/website -> log website usage
router.post('/website', logWebsite);

// GET /activity/summary/:studentId -> get aggregated times
router.get('/summary/:studentId', getSummary);

module.exports = router;
