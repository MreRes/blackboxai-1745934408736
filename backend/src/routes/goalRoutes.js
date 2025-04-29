const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// CRUD operations
router.post('/', goalController.create);
router.get('/', goalController.getAll);
router.get('/statistics', goalController.getStatistics);
router.get('/:id', goalController.getById);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.delete);

// Special operations
router.post('/:id/progress', goalController.updateProgress);

module.exports = router;
