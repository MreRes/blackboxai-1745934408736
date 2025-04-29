const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialGoal = sequelize.define('FinancialGoal', {
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
    type: {
        type: DataTypes.ENUM('SAVINGS', 'DEBT_PAYMENT', 'INVESTMENT', 'PURCHASE', 'CUSTOM'),
        allowNull: false
    },
    targetAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    currentAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'IDR',
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    targetDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
        defaultValue: 'MEDIUM'
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'ACTIVE'
    },
    category: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    milestones: {
        type: DataTypes.JSONB,
        defaultValue: []
        // Structure: [{
        //     amount: number,
        //     date: Date,
        //     description: string,
        //     achieved: boolean
        // }]
    },
    reminderFrequency: {
        type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'NONE'),
        defaultValue: 'WEEKLY'
    },
    autoSaveAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    autoSaveFrequency: {
        type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'NONE'),
        defaultValue: 'NONE'
    },
    linkedAccounts: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
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
            fields: ['type']
        }
    ]
});

// Instance methods
FinancialGoal.prototype.getProgress = function() {
    return (parseFloat(this.currentAmount) / parseFloat(this.targetAmount)) * 100;
};

FinancialGoal.prototype.getRemainingAmount = function() {
    return parseFloat(this.targetAmount) - parseFloat(this.currentAmount);
};

FinancialGoal.prototype.isAchieved = function() {
    return parseFloat(this.currentAmount) >= parseFloat(this.targetAmount);
};

FinancialGoal.prototype.getDaysRemaining = function() {
    const today = new Date();
    const target = new Date(this.targetDate);
    const diffTime = Math.abs(target - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

FinancialGoal.prototype.toDisplayFormat = function() {
    const values = this.get();
    return {
        ...values,
        targetAmount: parseFloat(values.targetAmount),
        currentAmount: parseFloat(values.currentAmount),
        progress: this.getProgress(),
        remainingAmount: this.getRemainingAmount(),
        daysRemaining: this.getDaysRemaining(),
        isAchieved: this.isAchieved(),
        formattedTargetAmount: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: values.currency
        }).format(values.targetAmount)
    };
};

module.exports = FinancialGoal;
