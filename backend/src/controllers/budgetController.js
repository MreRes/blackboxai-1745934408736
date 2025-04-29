const { Budget, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

const budgetController = {
    // Create new budget
    async create(req, res) {
        try {
            const {
                name,
                amount,
                period,
                startDate,
                endDate,
                categories,
                alerts,
                rollover
            } = req.body;

            // Validate input
            if (!name || !amount || !period || !startDate || !categories) {
                return res.status(400).json({
                    error: 'Nama, jumlah, periode, tanggal mulai, dan kategori harus diisi'
                });
            }

            // Check for overlapping budgets in the same categories
            const existingBudget = await Budget.findOne({
                where: {
                    userId: req.user.id,
                    status: 'ACTIVE',
                    categories: {
                        [Op.overlap]: categories
                    },
                    [Op.or]: [
                        {
                            startDate: {
                                [Op.between]: [startDate, endDate || startDate]
                            }
                        },
                        {
                            endDate: {
                                [Op.between]: [startDate, endDate || startDate]
                            }
                        }
                    ]
                }
            });

            if (existingBudget) {
                return res.status(400).json({
                    error: 'Sudah ada budget aktif untuk kategori dan periode yang sama'
                });
            }

            // Calculate current spending from existing transactions
            const currentSpending = await Transaction.sum('amount', {
                where: {
                    userId: req.user.id,
                    type: 'EXPENSE',
                    category: {
                        [Op.in]: categories
                    },
                    date: {
                        [Op.between]: [startDate, endDate || startDate]
                    }
                }
            }) || 0;

            // Create budget
            const budget = await Budget.create({
                userId: req.user.id,
                name,
                amount,
                period,
                startDate,
                endDate,
                categories,
                currentSpending,
                alerts,
                rollover,
                status: 'ACTIVE'
            });

            res.status(201).json({
                message: 'Budget berhasil dibuat',
                budget: budget.toDisplayFormat()
            });
        } catch (error) {
            console.error('Create budget error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat membuat budget'
            });
        }
    },

    // Get all budgets with filters
    async getAll(req, res) {
        try {
            const {
                status,
                period,
                page = 1,
                limit = 10,
                sortBy = 'startDate',
                sortOrder = 'DESC'
            } = req.query;

            // Build where clause
            const where = { userId: req.user.id };
            if (status) where.status = status;
            if (period) where.period = period;

            // Get budgets
            const { count, rows } = await Budget.findAndCountAll({
                where,
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: (page - 1) * limit
            });

            res.json({
                budgets: rows.map(b => b.toDisplayFormat()),
                pagination: {
                    total: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get budgets error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data budget'
            });
        }
    },

    // Get budget by ID
    async getById(req, res) {
        try {
            const budget = await Budget.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!budget) {
                return res.status(404).json({
                    error: 'Budget tidak ditemukan'
                });
            }

            // Get related transactions
            const transactions = await Transaction.findAll({
                where: {
                    userId: req.user.id,
                    type: 'EXPENSE',
                    category: {
                        [Op.in]: budget.categories
                    },
                    date: {
                        [Op.between]: [budget.startDate, budget.endDate || new Date()]
                    }
                },
                order: [['date', 'DESC']]
            });

            res.json({
                budget: budget.toDisplayFormat(),
                transactions: transactions.map(t => t.toDisplayFormat())
            });
        } catch (error) {
            console.error('Get budget error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data budget'
            });
        }
    },

    // Update budget
    async update(req, res) {
        const t = await sequelize.transaction();

        try {
            const budget = await Budget.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                },
                transaction: t
            });

            if (!budget) {
                await t.rollback();
                return res.status(404).json({
                    error: 'Budget tidak ditemukan'
                });
            }

            // If updating categories, recalculate current spending
            if (req.body.categories) {
                const currentSpending = await Transaction.sum('amount', {
                    where: {
                        userId: req.user.id,
                        type: 'EXPENSE',
                        category: {
                            [Op.in]: req.body.categories
                        },
                        date: {
                            [Op.between]: [
                                req.body.startDate || budget.startDate,
                                req.body.endDate || budget.endDate || new Date()
                            ]
                        }
                    },
                    transaction: t
                }) || 0;

                req.body.currentSpending = currentSpending;
            }

            // Update budget
            await budget.update(req.body, { transaction: t });
            await t.commit();

            res.json({
                message: 'Budget berhasil diperbarui',
                budget: budget.toDisplayFormat()
            });
        } catch (error) {
            await t.rollback();
            console.error('Update budget error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat memperbarui budget'
            });
        }
    },

    // Delete budget
    async delete(req, res) {
        try {
            const budget = await Budget.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!budget) {
                return res.status(404).json({
                    error: 'Budget tidak ditemukan'
                });
            }

            await budget.destroy();

            res.json({
                message: 'Budget berhasil dihapus'
            });
        } catch (error) {
            console.error('Delete budget error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat menghapus budget'
            });
        }
    },

    // Get budget statistics
    async getStatistics(req, res) {
        try {
            const { period } = req.query;
            const where = { 
                userId: req.user.id,
                status: 'ACTIVE'
            };
            if (period) where.period = period;

            // Get all active budgets
            const budgets = await Budget.findAll({ where });

            // Calculate statistics
            const statistics = budgets.map(budget => {
                const data = budget.toDisplayFormat();
                return {
                    id: budget.id,
                    name: budget.name,
                    amount: parseFloat(budget.amount),
                    currentSpending: parseFloat(budget.currentSpending),
                    remainingAmount: data.remainingAmount,
                    spendingPercentage: data.spendingPercentage,
                    isOverBudget: data.isOverBudget,
                    daysRemaining: Math.max(0, Math.floor((
                        new Date(budget.endDate || budget.startDate) - new Date()
                    ) / (1000 * 60 * 60 * 24))),
                    categories: budget.categories
                };
            });

            // Calculate overall statistics
            const totalBudget = statistics.reduce((sum, b) => sum + b.amount, 0);
            const totalSpending = statistics.reduce((sum, b) => sum + b.currentSpending, 0);
            const overBudgetCount = statistics.filter(b => b.isOverBudget).length;

            res.json({
                budgets: statistics,
                summary: {
                    totalBudget,
                    totalSpending,
                    remainingTotal: totalBudget - totalSpending,
                    overallPercentage: (totalSpending / totalBudget) * 100,
                    overBudgetCount,
                    totalBudgets: statistics.length
                }
            });
        } catch (error) {
            console.error('Get budget statistics error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil statistik budget'
            });
        }
    }
};

module.exports = budgetController;
