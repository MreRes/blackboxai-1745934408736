const express = require('express');
const router = express.Router();
const chatGroupController = require('../controllers/chatGroupController');
const { auth } = require('../middleware/auth');

router.use(auth);

// Chat group CRUD
router.post('/', chatGroupController.create);
router.get('/', chatGroupController.getAll);
router.get('/:id', chatGroupController.getById);

// Chat messages
router.post('/:id/messages', chatGroupController.sendMessage);
router.delete('/:id/messages/:messageId', chatGroupController.deleteMessage);

module.exports = router;
