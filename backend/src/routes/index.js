const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const transactionRoutes = require('./transactionRoutes');
const budgetRoutes = require('./budgetRoutes');
const goalRoutes = require('./goalRoutes');
const notificationRoutes = require('./notificationRoutes');
const recurringTransactionRoutes = require('./recurringTransactionRoutes');
const whatsappBot = require('../services/whatsappBot');
const { auth } = require('../middleware/auth');

// API routes
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/recurring-transactions', recurringTransactionRoutes);

// WhatsApp webhook
router.post('/webhook/whatsapp', async (req, res) => {
    try {
        const { message, from } = req.body;
        
        if (!message || !from) {
            return res.status(400).json({
                error: 'Message and sender information required'
            });
        }

        // Process message through WhatsApp bot
        const response = await whatsappBot.processMessage(message, from);
        
        res.json({
            message: 'Message processed successfully',
            response
        });
    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        res.status(500).json({
            error: 'Failed to process WhatsApp message'
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected',
            whatsapp: 'connected'
        }
    });
});

// Protected test endpoint
router.get('/protected', auth, (req, res) => {
    res.json({
        message: 'You have access to protected route',
        user: req.user.toPublicJSON()
    });
});

module.exports = router;
