const { Notification } = require('../models');
const whatsappBot = require('./whatsappBot');

class NotificationService {
    // Send notification through specified channels
    async sendNotification(notification) {
        const channels = notification.channels || ['whatsapp', 'email'];
        const errors = [];

        for (const channel of channels) {
            try {
                switch (channel) {
                    case 'whatsapp':
                        await this.sendWhatsAppNotification(notification);
                        break;
                    case 'email':
                        await this.sendEmailNotification(notification);
                        break;
                    default:
                        console.warn(`Unsupported notification channel: ${channel}`);
                }
            } catch (error) {
                console.error(`Error sending ${channel} notification:`, error);
                errors.push({ channel, error: error.message });
            }
        }

        // Update notification status
        notification.sentAt = new Date();
        await notification.save();

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    // Send WhatsApp notification
    async sendWhatsAppNotification(notification) {
        const user = await notification.getUser();
        if (!user.whatsappNumber) {
            throw new Error('User WhatsApp number not found');
        }

        const message = this.formatNotificationMessage(notification);
        await whatsappBot.sendMessage(user.whatsappNumber, message);
    }

    // Send email notification (placeholder for email implementation)
    async sendEmailNotification(notification) {
        const user = await notification.getUser();
        if (!user.email) {
            throw new Error('User email not found');
        }

        // TODO: Implement email sending logic
        console.log('Email notification placeholder:', {
            to: user.email,
            subject: notification.title,
            message: notification.message
        });
    }

    // Format notification message
    formatNotificationMessage(notification) {
        let message = `*${notification.title}*\n\n`;
        message += notification.message;

        if (notification.metadata) {
            switch (notification.type) {
                case 'BUDGET_ALERT':
                    message += this.formatBudgetAlert(notification.metadata);
                    break;
                case 'GOAL_MILESTONE':
                    message += this.formatGoalMilestone(notification.metadata);
                    break;
                case 'BILL_REMINDER':
                    message += this.formatBillReminder(notification.metadata);
                    break;
                case 'TRANSACTION_ALERT':
                    message += this.formatTransactionAlert(notification.metadata);
                    break;
            }
        }

        return message;
    }

    // Format budget alert message
    formatBudgetAlert(metadata) {
        let message = '\n\n';
        if (metadata.budget) {
            const { name, amount, currentSpending, remainingAmount } = metadata.budget;
            const percentage = ((currentSpending / amount) * 100).toFixed(1);

            message += `Budget: ${name}\n`;
            message += `Total: Rp${amount.toLocaleString('id-ID')}\n`;
            message += `Terpakai: Rp${currentSpending.toLocaleString('id-ID')} (${percentage}%)\n`;
            message += `Sisa: Rp${remainingAmount.toLocaleString('id-ID')}`;
        }
        return message;
    }

    // Format goal milestone message
    formatGoalMilestone(metadata) {
        let message = '\n\n';
        if (metadata.goal) {
            const { name, targetAmount, currentAmount } = metadata.goal;
            const percentage = ((currentAmount / targetAmount) * 100).toFixed(1);

            message += `Target: ${name}\n`;
            message += `Progress: ${percentage}%\n`;
            message += `Terkumpul: Rp${currentAmount.toLocaleString('id-ID')}\n`;
            message += `Target: Rp${targetAmount.toLocaleString('id-ID')}`;
        }
        return message;
    }

    // Format bill reminder message
    formatBillReminder(metadata) {
        let message = '\n\n';
        if (metadata.bill) {
            const { description, amount, dueDate } = metadata.bill;
            const formattedDate = new Date(dueDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            message += `Tagihan: ${description}\n`;
            message += `Jumlah: Rp${amount.toLocaleString('id-ID')}\n`;
            message += `Jatuh Tempo: ${formattedDate}`;
        }
        return message;
    }

    // Format transaction alert message
    formatTransactionAlert(metadata) {
        let message = '\n\n';
        if (metadata.transaction) {
            const { type, amount, category, description } = metadata.transaction;
            const formattedType = type === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan';

            message += `${formattedType}\n`;
            message += `Jumlah: Rp${amount.toLocaleString('id-ID')}\n`;
            message += `Kategori: ${category}\n`;
            if (description) message += `Keterangan: ${description}`;
        }
        return message;
    }

    // Process scheduled notifications
    async processScheduledNotifications() {
        try {
            const now = new Date();
            const scheduledNotifications = await Notification.findAll({
                where: {
                    scheduledFor: {
                        [Op.lte]: now
                    },
                    sentAt: null
                }
            });

            for (const notification of scheduledNotifications) {
                await this.sendNotification(notification);
            }

            return {
                success: true,
                processed: scheduledNotifications.length
            };
        } catch (error) {
            console.error('Process scheduled notifications error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create and send notification
    async createAndSend({
        userId,
        type,
        title,
        message,
        priority = 'MEDIUM',
        channels = ['whatsapp', 'email'],
        metadata = {},
        scheduledFor = null
    }) {
        try {
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                priority,
                channels,
                metadata,
                scheduledFor,
                status: 'UNREAD'
            });

            if (!scheduledFor) {
                await this.sendNotification(notification);
            }

            return {
                success: true,
                notification
            };
        } catch (error) {
            console.error('Create and send notification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new NotificationService();
