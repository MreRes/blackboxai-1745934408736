const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
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
    name: {
        type: DataTypes.STRING,
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
    period: {
        type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'),
        allowNull: false,
        defaultValue: 'MONTHLY'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE
    },
    categories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    currentSpending: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    alerts: {
        type: DataTypes.JSONB,
        defaultValue: {
            threshold: 80, // Percentage of budget
            enabled: true,
            channels: ['whatsapp', 'email']
        }
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'COMPLETED'),
        defaultValue: 'ACTIVE'
    },
    rollover: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    rolloverAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT
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
            fields: ['period']
        },
        {
            fields: ['status']
        }
    ]
});

// Instance methods
Budget.prototype.getRemainingAmount = function() {
    return parseFloat(this.amount) - parseFloat(this.currentSpending);
};

Budget.prototype.getSpendingPercentage = function() {
    return (parseFloat(this.currentSpending) / parseFloat(this.amount)) * 100;
};

Budget.prototype.isOverBudget = function() {
    return parseFloat(this.currentSpending) > parseFloat(this.amount);
};

Budget.prototype.toDisplayFormat = function() {
    const values = this.get();
    return {
        ...values,
        amount: parseFloat(values.amount),
        currentSpending: parseFloat(values.currentSpending),
        remainingAmount: this.getRemainingAmount(),
        spendingPercentage: this.getSpendingPercentage(),
        isOverBudget: this.isOverBudget(),
        formattedAmount: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: values.currency
        }).format(values.amount)
    };
};

module.exports = Budget;
