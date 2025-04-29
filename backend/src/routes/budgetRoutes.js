const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// CRUD operations
router.post('/', budgetController.create);
router.get('/', budgetController.getAll);
router.get('/statistics', budgetController.getStatistics);
router.get('/:id', budgetController.getById);
router.put('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

module.exports = router;
