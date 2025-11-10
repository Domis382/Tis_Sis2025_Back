const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/metrics.controller');

router.get('/', ctrl.dashboard);

module.exports = router;
