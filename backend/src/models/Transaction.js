const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    paymentMethod: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'COMPLETED'
    },
    location: {
        type: DataTypes.STRING
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    attachments: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    recurringTransactionId: {
        type: DataTypes.UUID,
        references: {
            model: 'RecurringTransactions',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['date']
        },
        {
            fields: ['category']
        },
        {
            fields: ['type']
        }
    ]
});

// Instance method to format transaction for display
Transaction.prototype.toDisplayFormat = function() {
    const values = this.get();
    return {
        ...values,
        amount: parseFloat(values.amount),
        formattedAmount: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: values.currency
        }).format(values.amount)
    };
};

module.exports = Transaction;
