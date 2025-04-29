require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const routes = require('./routes');
const { syncDatabase } = require('./models');
const whatsappBot = require('./services/whatsappBot');
const notificationService = require('./services/notificationService');
const recurringTransactionService = require('./services/recurringTransactionService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WhatsApp Client Setup
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

client.on('message', async (message) => {
    try {
        // Process incoming WhatsApp messages
        const response = await whatsappBot.processMessage(
            message.body,
            message.from
        );
        message.reply(response);
    } catch (error) {
        console.error('Error processing WhatsApp message:', error);
        message.reply('Maaf, terjadi kesalahan dalam memproses pesan Anda.');
    }
});

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Initialize services and start server
const initializeApp = async () => {
    try {
        // Initialize WhatsApp client
        await client.initialize();
        console.log('WhatsApp client initialized');

        // Sync database
        await syncDatabase();
        console.log('Database synchronized');

        // Initialize recurring transaction scheduler
        await recurringTransactionService.initializeScheduler();
        console.log('Recurring transaction scheduler initialized');

        // Process any pending notifications
        await notificationService.processScheduledNotifications();
        console.log('Pending notifications processed');

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
    console.log('Received shutdown signal. Starting graceful shutdown...');

    try {
        // Close WhatsApp client
        await client.destroy();
        console.log('WhatsApp client closed');

        // Close database connection
        await require('./config/database').close();
        console.log('Database connection closed');

        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    gracefulShutdown();
});

// Initialize application
initializeApp();

module.exports = app;
