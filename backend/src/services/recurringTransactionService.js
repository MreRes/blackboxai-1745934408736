const { RecurringTransaction, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('./notificationService');

class RecurringTransactionService {
    // Process all due recurring transactions
    async processDueTransactions() {
        const t = await sequelize.transaction();

        try {
            const now = new Date();
            const dueTransactions = await RecurringTransaction.findAll({
                where: {
                    status: 'ACTIVE',
                    nextDue: {
                        [Op.lte]: now
                    },
                    [Op.or]: [
                        { endDate: null },
                        { endDate: { [Op.gt]: now } }
                    ]
                },
                transaction: t
            });

            const results = [];
            for (const recurringTransaction of dueTransactions) {
                try {
                    // Process the transaction
                    const transaction = await recurringTransaction.process();
                    
                    // Send notification if transaction is processed
                    if (transaction) {
                        await this.sendTransactionNotification(recurringTransaction, transaction);
                    }

                    results.push({
                        id: recurringTransaction.id,
                        success: true,
                        transaction
                    });
                } catch (error) {
                    console.error(`Error processing recurring transaction ${recurringTransaction.id}:`, error);
                    results.push({
                        id: recurringTransaction.id,
                        success: false,
                        error: error.message
                    });
                }
            }

            await t.commit();

            return {
                success: true,
                processed: results.length,
                results
            };
        } catch (error) {
            await t.rollback();
            console.error('Process due transactions error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send notification for processed transaction
    async sendTransactionNotification(recurringTransaction, transaction) {
        const type = transaction.type === 'EXPENSE' ? 'pengeluaran' : 'pemasukan';
        
        await notificationService.createAndSend({
            userId: recurringTransaction.userId,
            type: 'TRANSACTION_ALERT',
            title: `Transaksi Berulang: ${type} telah diproses`,
            message: `Transaksi berulang untuk ${recurringTransaction.description || recurringTransaction.category} telah diproses.`,
            priority: 'LOW',
            metadata: {
                transaction: {
                    id: transaction.id,
                    type: transaction.type,
                    amount: transaction.amount,
                    category: transaction.category,
                    description: transaction.description
                },
                recurringTransaction: {
                    id: recurringTransaction.id,
                    nextDue: recurringTransaction.nextDue
                }
            }
        });
    }

    // Send reminders for upcoming transactions
    async sendUpcomingReminders() {
        try {
            const now = new Date();
            const recurringTransactions = await RecurringTransaction.findAll({
                where: {
                    status: 'ACTIVE',
                    nextDue: {
                        [Op.gt]: now
                    }
                }
            });

            const results = [];
            for (const recurringTransaction of recurringTransactions) {
                try {
                    const daysUntilDue = Math.ceil(
                        (recurringTransaction.nextDue - now) / (1000 * 60 * 60 * 24)
                    );

                    // Check if reminder should be sent based on reminderDays
                    if (daysUntilDue <= recurringTransaction.reminderDays) {
                        await this.sendReminderNotification(recurringTransaction, daysUntilDue);
                        results.push({
                            id: recurringTransaction.id,
                            success: true,
                            daysUntilDue
                        });
                    }
                } catch (error) {
                    console.error(`Error sending reminder for transaction ${recurringTransaction.id}:`, error);
                    results.push({
                        id: recurringTransaction.id,
                        success: false,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                processed: results.length,
                results
            };
        } catch (error) {
            console.error('Send upcoming reminders error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send reminder notification
    async sendReminderNotification(recurringTransaction, daysUntilDue) {
        const type = recurringTransaction.type === 'EXPENSE' ? 'pengeluaran' : 'pemasukan';
        const dueDate = recurringTransaction.nextDue.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        await notificationService.createAndSend({
            userId: recurringTransaction.userId,
            type: 'BILL_REMINDER',
            title: `Pengingat: ${type} berulang akan datang`,
            message: `Transaksi berulang untuk ${recurringTransaction.description || recurringTransaction.category} akan diproses dalam ${daysUntilDue} hari.`,
            priority: 'MEDIUM',
            metadata: {
                bill: {
                    description: recurringTransaction.description || recurringTransaction.category,
                    amount: recurringTransaction.amount,
                    dueDate: recurringTransaction.nextDue
                },
                recurringTransaction: {
                    id: recurringTransaction.id,
                    type: recurringTransaction.type,
                    frequency: recurringTransaction.frequency
                }
            }
        });
    }

    // Check and update transaction statuses
    async updateStatuses() {
        try {
            const now = new Date();
            
            // Find transactions that have passed their end date
            const completedTransactions = await RecurringTransaction.findAll({
                where: {
                    status: 'ACTIVE',
                    endDate: {
                        [Op.lt]: now
                    }
                }
            });

            // Update their status to COMPLETED
            for (const transaction of completedTransactions) {
                transaction.status = 'COMPLETED';
                await transaction.save();
            }

            return {
                success: true,
                updated: completedTransactions.length
            };
        } catch (error) {
            console.error('Update statuses error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Initialize recurring transaction scheduler
    async initializeScheduler() {
        // Process due transactions every hour
        setInterval(async () => {
            console.log('Processing due recurring transactions...');
            await this.processDueTransactions();
        }, 60 * 60 * 1000); // Every hour

        // Send reminders daily
        setInterval(async () => {
            console.log('Sending recurring transaction reminders...');
            await this.sendUpcomingReminders();
        }, 24 * 60 * 60 * 1000); // Every 24 hours

        // Update statuses daily
        setInterval(async () => {
            console.log('Updating recurring transaction statuses...');
            await this.updateStatuses();
        }, 24 * 60 * 60 * 1000); // Every 24 hours

        console.log('Recurring transaction scheduler initialized');
    }
}

module.exports = new RecurringTransactionService();
