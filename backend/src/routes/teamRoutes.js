const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { auth } = require('../middleware/auth');

router.use(auth);

// Team CRUD
router.post('/', teamController.create);
router.get('/', teamController.getAll);
router.get('/:id', teamController.getById);
router.put('/:id', teamController.update);
router.delete('/:id', teamController.delete);

// Team members management
router.post('/:id/members', teamController.addMember);
router.delete('/:id/members/:userId', teamController.removeMember);

module.exports = router;
