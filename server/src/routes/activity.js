const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity');

// POST /activity/social  -> log social media usage
router.post('/social', activityController.logSocial);

// POST /activity/website -> log website usage
router.post('/website', activityController.logWebsite);

// GET /activity/summary/:studentId -> get aggregated times
router.get('/summary/:studentId', activityController.getSummary);

module.exports = router;
