const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM(
            'BUDGET_ALERT',
            'GOAL_MILESTONE',
            'BILL_REMINDER',
            'TRANSACTION_ALERT',
            'SYSTEM_NOTIFICATION'
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('UNREAD', 'READ', 'ARCHIVED'),
        defaultValue: 'UNREAD'
    },
    priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
        defaultValue: 'MEDIUM'
    },
    channels: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: ['whatsapp', 'email']
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    scheduledFor: {
        type: DataTypes.DATE
    },
    sentAt: {
        type: DataTypes.DATE
    },
    readAt: {
        type: DataTypes.DATE
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['scheduledFor']
        }
    ]
});

// Instance methods
Notification.prototype.markAsRead = async function() {
    this.status = 'READ';
    this.readAt = new Date();
    await this.save();
};

Notification.prototype.archive = async function() {
    this.status = 'ARCHIVED';
    await this.save();
};

Notification.prototype.send = async function() {
    // Implementation for sending notification through different channels
    // will be added in the notification service
    this.sentAt = new Date();
    await this.save();
};

module.exports = Notification;
