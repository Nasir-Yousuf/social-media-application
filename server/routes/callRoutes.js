const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/ice-servers', callController.getIceServers);
router.get('/turn-credentials', callController.getIceServers);
router.get('/history', callController.getCallHistory);

module.exports = router;
