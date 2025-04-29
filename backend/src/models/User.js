const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    whatsappNumber: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            is: /^\+[1-9]\d{1,14}$/ // International phone number format
        }
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastLogin: {
        type: DataTypes.DATE
    },
    preferences: {
        type: DataTypes.JSONB,
        defaultValue: {
            currency: 'IDR',
            language: 'id',
            notifications: {
                email: true,
                whatsapp: true
            }
        }
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to check password
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Instance method to get public profile
User.prototype.toPublicJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;
