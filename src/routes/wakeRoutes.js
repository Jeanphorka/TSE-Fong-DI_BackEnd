const express = require('express');
const router = express.Router();
const wakeController = require('../controllers/wakeController');

router.get('/', wakeController.getAllWake);

module.exports = router;