const express = require('express');
const router = express.Router();
const recurringTransactionController = require('../controllers/recurringTransactionController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// CRUD operations
router.post('/', recurringTransactionController.create);
router.get('/', recurringTransactionController.getAll);
router.get('/:id', recurringTransactionController.getById);
router.put('/:id', recurringTransactionController.update);
router.delete('/:id', recurringTransactionController.delete);

// Special operations
router.post('/:id/process', recurringTransactionController.process);
router.put('/:id/pause', recurringTransactionController.pause);
router.put('/:id/resume', recurringTransactionController.resume);
router.put('/:id/cancel', recurringTransactionController.cancel);

module.exports = router;
