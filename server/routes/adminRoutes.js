const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth, requireAdmin);

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.toggleUserRole);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.get('/posts', adminController.getAllPosts);
router.get('/audit-logs', adminController.getAuditLogs);
router.post('/purge-all-data', adminController.purgeAllData);

module.exports = router;
