const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// CRUD operations
router.post('/', transactionController.create);
router.get('/', transactionController.getAll);
router.get('/statistics', transactionController.getStatistics);
router.get('/:id', transactionController.getById);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.delete);

module.exports = router;
