const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/monthly-report', analyticsController.monthlyReport);
router.get('/category-trends', analyticsController.categoryTrends);
router.get('/spending-prediction', analyticsController.spendingPrediction);

module.exports = router;
