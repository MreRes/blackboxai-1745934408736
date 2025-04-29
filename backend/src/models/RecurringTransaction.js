const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecurringTransaction = sequelize.define('RecurringTransaction', {
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
        type: DataTypes.ENUM('INCOME', 'EXPENSE', 'TRANSFER'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'IDR',
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subcategory: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    frequency: {
        type: DataTypes.ENUM(
            'DAILY',
            'WEEKLY',
            'BIWEEKLY',
            'MONTHLY',
            'QUARTERLY',
            'YEARLY',
            'CUSTOM'
        ),
        allowNull: false
    },
    customFrequency: {
        type: DataTypes.JSONB,
        // For custom frequencies, store detailed scheduling information
        // Example: { days: [1, 15], months: [1, 7], dayOfWeek: 1 }
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE
    },
    lastProcessed: {
        type: DataTypes.DATE
    },
    nextDue: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'ACTIVE'
    },
    paymentMethod: {
        type: DataTypes.STRING
    },
    reminderDays: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        comment: 'Days before due date to send reminder'
    },
    autoProcess: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether to automatically create transactions'
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['status']
        },
        {
            fields: ['nextDue']
        }
    ]
});

// Instance methods
RecurringTransaction.prototype.calculateNextDue = function() {
    const now = new Date();
    let nextDue = new Date(this.nextDue || this.startDate);

    // If next due date is in the past, calculate the next occurrence
    while (nextDue < now) {
        switch (this.frequency) {
            case 'DAILY':
                nextDue.setDate(nextDue.getDate() + 1);
                break;
            case 'WEEKLY':
                nextDue.setDate(nextDue.getDate() + 7);
                break;
            case 'BIWEEKLY':
                nextDue.setDate(nextDue.getDate() + 14);
                break;
            case 'MONTHLY':
                nextDue.setMonth(nextDue.getMonth() + 1);
                break;
            case 'QUARTERLY':
                nextDue.setMonth(nextDue.getMonth() + 3);
                break;
            case 'YEARLY':
                nextDue.setFullYear(nextDue.getFullYear() + 1);
                break;
            case 'CUSTOM':
                // Handle custom frequency logic
                if (this.customFrequency) {
                    // Implementation will depend on customFrequency structure
                    // This is a placeholder for custom scheduling logic
                }
                break;
        }

        // Check if we've passed the end date
        if (this.endDate && nextDue > this.endDate) {
            this.status = 'COMPLETED';
            return null;
        }
    }

    return nextDue;
};

RecurringTransaction.prototype.process = async function() {
    const t = await sequelize.transaction();

    try {
        // Create the actual transaction
        const transaction = await Transaction.create({
            userId: this.userId,
            type: this.type,
            amount: this.amount,
            currency: this.currency,
            category: this.category,
            subcategory: this.subcategory,
            description: this.description,
            date: new Date(),
            paymentMethod: this.paymentMethod,
            status: 'COMPLETED',
            recurringTransactionId: this.id
        }, { transaction: t });

        // Update the recurring transaction
        this.lastProcessed = new Date();
        this.nextDue = this.calculateNextDue();
        
        if (this.nextDue === null) {
            this.status = 'COMPLETED';
        }

        await this.save({ transaction: t });
        await t.commit();

        return transaction;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

RecurringTransaction.prototype.pause = async function() {
    this.status = 'PAUSED';
    await this.save();
};

RecurringTransaction.prototype.resume = async function() {
    this.status = 'ACTIVE';
    this.nextDue = this.calculateNextDue();
    await this.save();
};

RecurringTransaction.prototype.cancel = async function() {
    this.status = 'CANCELLED';
    await this.save();
};

module.exports = RecurringTransaction;
