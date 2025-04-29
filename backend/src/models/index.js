const sequelize = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');
const Budget = require('./Budget');
const FinancialGoal = require('./FinancialGoal');
const Notification = require('./Notification');
const RecurringTransaction = require('./RecurringTransaction');
const Team = require('./Team');
const TeamMember = require('./TeamMember');

// User relationships
User.hasMany(Transaction, {
    foreignKey: 'userId',
    as: 'transactions',
    onDelete: 'CASCADE'
});
Transaction.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Budget, {
    foreignKey: 'userId',
    as: 'budgets',
    onDelete: 'CASCADE'
});
Budget.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(FinancialGoal, {
    foreignKey: 'userId',
    as: 'financialGoals',
    onDelete: 'CASCADE'
});
FinancialGoal.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Notification, {
    foreignKey: 'userId',
    as: 'notifications',
    onDelete: 'CASCADE'
});
Notification.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(RecurringTransaction, {
    foreignKey: 'userId',
    as: 'recurringTransactions',
    onDelete: 'CASCADE'
});
RecurringTransaction.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Team relationships
Team.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner'
});
User.hasMany(Team, {
    foreignKey: 'ownerId',
    as: 'ownedTeams'
});

Team.hasMany(TeamMember, {
    foreignKey: 'teamId',
    as: 'members'
});
TeamMember.belongsTo(Team, {
    foreignKey: 'teamId',
    as: 'team'
});

User.hasMany(TeamMember, {
    foreignKey: 'userId',
    as: 'teamMemberships'
});
TeamMember.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// RecurringTransaction relationships
RecurringTransaction.hasMany(Transaction, {
    foreignKey: 'recurringTransactionId',
    as: 'transactions'
});
Transaction.belongsTo(RecurringTransaction, {
    foreignKey: 'recurringTransactionId',
    as: 'recurringTransaction'
});

// Budget relationships with transactions
Budget.hasMany(Transaction, {
    foreignKey: 'budgetId',
    as: 'transactions'
});
Transaction.belongsTo(Budget, {
    foreignKey: 'budgetId',
    as: 'budget'
});

// FinancialGoal relationships with transactions
FinancialGoal.hasMany(Transaction, {
    foreignKey: 'goalId',
    as: 'transactions'
});
Transaction.belongsTo(FinancialGoal, {
    foreignKey: 'goalId',
    as: 'goal'
});

// Sync all models with database
const ChatGroup = require('./ChatGroup');
const ChatMessage = require('./ChatMessage');

const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing database:', error);
    }
};

// Add ChatGroup and ChatMessage relationships
ChatGroup.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner'
});
User.hasMany(ChatGroup, {
    foreignKey: 'ownerId',
    as: 'ownedChatGroups'
});

ChatGroup.hasMany(ChatMessage, {
    foreignKey: 'groupId',
    as: 'messages'
});
ChatMessage.belongsTo(ChatGroup, {
    foreignKey: 'groupId',
    as: 'group'
});

User.hasMany(ChatMessage, {
    foreignKey: 'senderId',
    as: 'sentMessages'
});
ChatMessage.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'sender'
});

module.exports = {
    sequelize,
    User,
    Transaction,
    Budget,
    FinancialGoal,
    Notification,
    RecurringTransaction,
    Team,
    TeamMember,
    ChatGroup,
    ChatMessage,
    syncDatabase
};
