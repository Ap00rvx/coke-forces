const express = require('express');
const router = express.Router();

const configController = require('../controller/config.controller');


// Route to get the current cron schedule
router.get('/cron', configController.getConfig);
// Route to update the cron schedule
router.put('/cron', configController.setConfig);



module.exports = router;