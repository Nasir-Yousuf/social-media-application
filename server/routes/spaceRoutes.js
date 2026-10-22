const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, spaceController.getActiveSpaces);
router.post('/', optionalAuth, spaceController.createSpace);
router.get('/:id', optionalAuth, spaceController.getSpaceById);
router.delete('/:id', optionalAuth, spaceController.endSpace);

module.exports = router;
