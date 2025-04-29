const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get notifications
router.get('/', notificationController.getAll);
router.get('/unread-count', notificationController.getUnreadCount);

// Create notification
router.post('/', notificationController.create);

// Update notifications
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/archive', notificationController.archive);

// Delete notification
router.delete('/:id', notificationController.delete);

module.exports = router;
