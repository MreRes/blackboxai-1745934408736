const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ChatGroups',
            key: 'id'
        }
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM'),
        defaultValue: 'TEXT'
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['groupId']
        },
        {
            fields: ['senderId']
        }
    ]
});

module.exports = ChatMessage;
