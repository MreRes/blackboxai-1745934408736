const { Transaction, Budget, sequelize } = require('../models');
const { Op } = require('sequelize');

const transactionController = {
    // Create new transaction
    async create(req, res) {
        const t = await sequelize.transaction();

        try {
            const {
                type,
                amount,
                category,
                subcategory,
                description,
                date,
                paymentMethod,
                location,
                tags
            } = req.body;

            // Validate input
            if (!type || !amount || !category) {
                return res.status(400).json({
                    error: 'Tipe, jumlah, dan kategori harus diisi'
                });
            }

            // Create transaction
            const transaction = await Transaction.create({
                userId: req.user.id,
                type,
                amount,
                category,
                subcategory,
                description,
                date: date || new Date(),
                paymentMethod,
                location,
                tags,
                status: 'COMPLETED'
            }, { transaction: t });

            // Update budget if transaction is an expense
            if (type === 'EXPENSE') {
                const budget = await Budget.findOne({
                    where: {
                        userId: req.user.id,
                        categories: {
                            [Op.contains]: [category]
                        },
                        status: 'ACTIVE'
                    },
                    transaction: t
                });

                if (budget) {
                    budget.currentSpending = parseFloat(budget.currentSpending) + parseFloat(amount);
                    await budget.save({ transaction: t });
                }
            }

            await t.commit();

            res.status(201).json({
                message: 'Transaksi berhasil dicatat',
                transaction: transaction.toDisplayFormat()
            });
        } catch (error) {
            await t.rollback();
            console.error('Create transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mencatat transaksi'
            });
        }
    },

    // Get all transactions with filters
    async getAll(req, res) {
        try {
            const {
                type,
                category,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                page = 1,
                limit = 10,
                sortBy = 'date',
                sortOrder = 'DESC'
            } = req.query;

            // Build where clause
            const where = { userId: req.user.id };
            if (type) where.type = type;
            if (category) where.category = category;
            if (startDate || endDate) {
                where.date = {};
                if (startDate) where.date[Op.gte] = new Date(startDate);
                if (endDate) where.date[Op.lte] = new Date(endDate);
            }
            if (minAmount || maxAmount) {
                where.amount = {};
                if (minAmount) where.amount[Op.gte] = minAmount;
                if (maxAmount) where.amount[Op.lte] = maxAmount;
            }

            // Get transactions
            const { count, rows } = await Transaction.findAndCountAll({
                where,
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: (page - 1) * limit
            });

            // Calculate totals
            const totals = await Transaction.findAll({
                where,
                attributes: [
                    'type',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                group: ['type']
            });

            const formattedTotals = totals.reduce((acc, curr) => {
                acc[curr.type.toLowerCase()] = parseFloat(curr.getDataValue('total'));
                return acc;
            }, {});

            res.json({
                transactions: rows.map(t => t.toDisplayFormat()),
                totals: formattedTotals,
                pagination: {
                    total: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get transactions error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data transaksi'
            });
        }
    },

    // Get transaction by ID
    async getById(req, res) {
        try {
            const transaction = await Transaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!transaction) {
                return res.status(404).json({
                    error: 'Transaksi tidak ditemukan'
                });
            }

            res.json({
                transaction: transaction.toDisplayFormat()
            });
        } catch (error) {
            console.error('Get transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data transaksi'
            });
        }
    },

    // Update transaction
    async update(req, res) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                },
                transaction: t
            });

            if (!transaction) {
                await t.rollback();
                return res.status(404).json({
                    error: 'Transaksi tidak ditemukan'
                });
            }

            // If changing amount or category of an expense, update budget
            if (transaction.type === 'EXPENSE' &&
                (req.body.amount !== undefined || req.body.category !== undefined)) {
                
                // Revert old budget
                const oldBudget = await Budget.findOne({
                    where: {
                        userId: req.user.id,
                        categories: {
                            [Op.contains]: [transaction.category]
                        },
                        status: 'ACTIVE'
                    },
                    transaction: t
                });

                if (oldBudget) {
                    oldBudget.currentSpending = parseFloat(oldBudget.currentSpending) - parseFloat(transaction.amount);
                    await oldBudget.save({ transaction: t });
                }

                // Update new budget if category changed
                if (req.body.category && req.body.category !== transaction.category) {
                    const newBudget = await Budget.findOne({
                        where: {
                            userId: req.user.id,
                            categories: {
                                [Op.contains]: [req.body.category]
                            },
                            status: 'ACTIVE'
                        },
                        transaction: t
                    });

                    if (newBudget) {
                        newBudget.currentSpending = parseFloat(newBudget.currentSpending) + 
                            parseFloat(req.body.amount || transaction.amount);
                        await newBudget.save({ transaction: t });
                    }
                } else if (oldBudget && req.body.amount) {
                    // Update same budget with new amount
                    oldBudget.currentSpending = parseFloat(oldBudget.currentSpending) + 
                        parseFloat(req.body.amount);
                    await oldBudget.save({ transaction: t });
                }
            }

            // Update transaction
            await transaction.update(req.body, { transaction: t });
            await t.commit();

            res.json({
                message: 'Transaksi berhasil diperbarui',
                transaction: transaction.toDisplayFormat()
            });
        } catch (error) {
            await t.rollback();
            console.error('Update transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat memperbarui transaksi'
            });
        }
    },

    // Delete transaction
    async delete(req, res) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                },
                transaction: t
            });

            if (!transaction) {
                await t.rollback();
                return res.status(404).json({
                    error: 'Transaksi tidak ditemukan'
                });
            }

            // Update budget if transaction is an expense
            if (transaction.type === 'EXPENSE') {
                const budget = await Budget.findOne({
                    where: {
                        userId: req.user.id,
                        categories: {
                            [Op.contains]: [transaction.category]
                        },
                        status: 'ACTIVE'
                    },
                    transaction: t
                });

                if (budget) {
                    budget.currentSpending = parseFloat(budget.currentSpending) - parseFloat(transaction.amount);
                    await budget.save({ transaction: t });
                }
            }

            await transaction.destroy({ transaction: t });
            await t.commit();

            res.json({
                message: 'Transaksi berhasil dihapus'
            });
        } catch (error) {
            await t.rollback();
            console.error('Delete transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat menghapus transaksi'
            });
        }
    },

    // Get transaction statistics
    async getStatistics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const where = { 
                userId: req.user.id,
                date: {}
            };

            if (startDate) where.date[Op.gte] = new Date(startDate);
            if (endDate) where.date[Op.lte] = new Date(endDate);

            // Get category totals
            const categoryTotals = await Transaction.findAll({
                where,
                attributes: [
                    'type',
                    'category',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                group: ['type', 'category']
            });

            // Get daily totals
            const dailyTotals = await Transaction.findAll({
                where,
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('date')), 'date'],
                    'type',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                group: [
                    sequelize.fn('DATE', sequelize.col('date')),
                    'type'
                ],
                order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']]
            });

            res.json({
                categoryTotals: categoryTotals.map(t => ({
                    type: t.type,
                    category: t.category,
                    total: parseFloat(t.getDataValue('total'))
                })),
                dailyTotals: dailyTotals.map(t => ({
                    date: t.getDataValue('date'),
                    type: t.type,
                    total: parseFloat(t.getDataValue('total'))
                }))
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil statistik transaksi'
            });
        }
    }
};

module.exports = transactionController;
