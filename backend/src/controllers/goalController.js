const { FinancialGoal, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

const goalController = {
    // Create new financial goal
    async create(req, res) {
        try {
            const {
                name,
                type,
                targetAmount,
                targetDate,
                description,
                priority,
                milestones,
                reminderFrequency,
                autoSaveAmount,
                autoSaveFrequency,
                linkedAccounts
            } = req.body;

            // Validate input
            if (!name || !type || !targetAmount || !targetDate) {
                return res.status(400).json({
                    error: 'Nama, tipe, jumlah target, dan tanggal target harus diisi'
                });
            }

            // Create goal
            const goal = await FinancialGoal.create({
                userId: req.user.id,
                name,
                type,
                targetAmount,
                targetDate,
                description,
                priority,
                milestones,
                reminderFrequency,
                autoSaveAmount,
                autoSaveFrequency,
                linkedAccounts,
                status: 'ACTIVE'
            });

            res.status(201).json({
                message: 'Target keuangan berhasil dibuat',
                goal: goal.toDisplayFormat()
            });
        } catch (error) {
            console.error('Create goal error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat membuat target keuangan'
            });
        }
    },

    // Get all financial goals with filters
    async getAll(req, res) {
        try {
            const {
                type,
                status,
                priority,
                page = 1,
                limit = 10,
                sortBy = 'targetDate',
                sortOrder = 'ASC'
            } = req.query;

            // Build where clause
            const where = { userId: req.user.id };
            if (type) where.type = type;
            if (status) where.status = status;
            if (priority) where.priority = priority;

            // Get goals
            const { count, rows } = await FinancialGoal.findAndCountAll({
                where,
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: (page - 1) * limit
            });

            res.json({
                goals: rows.map(g => g.toDisplayFormat()),
                pagination: {
                    total: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get goals error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data target keuangan'
            });
        }
    },

    // Get goal by ID
    async getById(req, res) {
        try {
            const goal = await FinancialGoal.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!goal) {
                return res.status(404).json({
                    error: 'Target keuangan tidak ditemukan'
                });
            }

            // Get related transactions if goal has linked accounts
            let transactions = [];
            if (goal.linkedAccounts && goal.linkedAccounts.length > 0) {
                transactions = await Transaction.findAll({
                    where: {
                        userId: req.user.id,
                        category: {
                            [Op.in]: goal.linkedAccounts
                        },
                        date: {
                            [Op.gte]: goal.startDate
                        }
                    },
                    order: [['date', 'DESC']]
                });
            }

            res.json({
                goal: goal.toDisplayFormat(),
                transactions: transactions.map(t => t.toDisplayFormat())
            });
        } catch (error) {
            console.error('Get goal error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data target keuangan'
            });
        }
    },

    // Update goal
    async update(req, res) {
        const t = await sequelize.transaction();

        try {
            const goal = await FinancialGoal.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                },
                transaction: t
            });

            if (!goal) {
                await t.rollback();
                return res.status(404).json({
                    error: 'Target keuangan tidak ditemukan'
                });
            }

            // Update milestone achievement if provided
            if (req.body.milestones) {
                req.body.milestones = req.body.milestones.map(milestone => ({
                    ...milestone,
                    achieved: milestone.amount <= (req.body.currentAmount || goal.currentAmount)
                }));
            }

            // Update goal
            await goal.update(req.body, { transaction: t });
            await t.commit();

            res.json({
                message: 'Target keuangan berhasil diperbarui',
                goal: goal.toDisplayFormat()
            });
        } catch (error) {
            await t.rollback();
            console.error('Update goal error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat memperbarui target keuangan'
            });
        }
    },

    // Delete goal
    async delete(req, res) {
        try {
            const goal = await FinancialGoal.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!goal) {
                return res.status(404).json({
                    error: 'Target keuangan tidak ditemukan'
                });
            }

            await goal.destroy();

            res.json({
                message: 'Target keuangan berhasil dihapus'
            });
        } catch (error) {
            console.error('Delete goal error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat menghapus target keuangan'
            });
        }
    },

    // Update goal progress
    async updateProgress(req, res) {
        const t = await sequelize.transaction();

        try {
            const { amount } = req.body;
            if (!amount) {
                return res.status(400).json({
                    error: 'Jumlah progress harus diisi'
                });
            }

            const goal = await FinancialGoal.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                    status: 'ACTIVE'
                },
                transaction: t
            });

            if (!goal) {
                await t.rollback();
                return res.status(404).json({
                    error: 'Target keuangan tidak ditemukan'
                });
            }

            // Update current amount
            const newAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
            await goal.update({
                currentAmount: newAmount,
                // Update milestone achievement
                milestones: goal.milestones.map(milestone => ({
                    ...milestone,
                    achieved: milestone.amount <= newAmount
                })),
                // Update status if goal is achieved
                status: newAmount >= goal.targetAmount ? 'COMPLETED' : 'ACTIVE'
            }, { transaction: t });

            await t.commit();

            res.json({
                message: 'Progress target keuangan berhasil diperbarui',
                goal: goal.toDisplayFormat()
            });
        } catch (error) {
            await t.rollback();
            console.error('Update progress error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat memperbarui progress'
            });
        }
    },

    // Get goal statistics
    async getStatistics(req, res) {
        try {
            const { type } = req.query;
            const where = { userId: req.user.id };
            if (type) where.type = type;

            // Get all goals
            const goals = await FinancialGoal.findAll({ where });

            // Calculate statistics
            const statistics = goals.map(goal => {
                const data = goal.toDisplayFormat();
                return {
                    id: goal.id,
                    name: goal.name,
                    type: goal.type,
                    targetAmount: parseFloat(goal.targetAmount),
                    currentAmount: parseFloat(goal.currentAmount),
                    progress: data.progress,
                    remainingAmount: data.remainingAmount,
                    daysRemaining: data.daysRemaining,
                    isAchieved: data.isAchieved,
                    status: goal.status
                };
            });

            // Calculate overall statistics
            const totalTargetAmount = statistics.reduce((sum, g) => sum + g.targetAmount, 0);
            const totalCurrentAmount = statistics.reduce((sum, g) => sum + g.currentAmount, 0);
            const achievedGoals = statistics.filter(g => g.isAchieved);

            res.json({
                goals: statistics,
                summary: {
                    totalTargetAmount,
                    totalCurrentAmount,
                    overallProgress: (totalCurrentAmount / totalTargetAmount) * 100,
                    achievedGoalsCount: achievedGoals.length,
                    totalGoals: statistics.length,
                    typeBreakdown: statistics.reduce((acc, g) => {
                        acc[g.type] = (acc[g.type] || 0) + 1;
                        return acc;
                    }, {})
                }
            });
        } catch (error) {
            console.error('Get goal statistics error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil statistik target keuangan'
            });
        }
    }
};

module.exports = goalController;
