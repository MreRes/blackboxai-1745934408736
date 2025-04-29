const { RecurringTransaction, Transaction } = require('../models');
const { Op } = require('sequelize');

const recurringTransactionController = {
    // Create new recurring transaction
    async create(req, res) {
        try {
            const {
                type,
                amount,
                category,
                subcategory,
                description,
                frequency,
                customFrequency,
                startDate,
                endDate,
                paymentMethod,
                reminderDays,
                autoProcess
            } = req.body;

            // Validate input
            if (!type || !amount || !category || !frequency || !startDate) {
                return res.status(400).json({
                    error: 'Tipe, jumlah, kategori, frekuensi, dan tanggal mulai harus diisi'
                });
            }

            // Create recurring transaction
            const recurringTransaction = await RecurringTransaction.create({
                userId: req.user.id,
                type,
                amount,
                category,
                subcategory,
                description,
                frequency,
                customFrequency,
                startDate,
                endDate,
                paymentMethod,
                reminderDays,
                autoProcess,
                nextDue: new Date(startDate)
            });

            res.status(201).json({
                message: 'Transaksi berulang berhasil dibuat',
                recurringTransaction
            });
        } catch (error) {
            console.error('Create recurring transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat membuat transaksi berulang'
            });
        }
    },

    // Get all recurring transactions
    async getAll(req, res) {
        try {
            const {
                type,
                status,
                frequency,
                page = 1,
                limit = 10,
                sortBy = 'nextDue',
                sortOrder = 'ASC'
            } = req.query;

            // Build where clause
            const where = { userId: req.user.id };
            if (type) where.type = type;
            if (status) where.status = status;
            if (frequency) where.frequency = frequency;

            const { count, rows } = await RecurringTransaction.findAndCountAll({
                where,
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: (page - 1) * limit,
                include: [{
                    model: Transaction,
                    as: 'transactions',
                    limit: 5,
                    order: [['date', 'DESC']]
                }]
            });

            res.json({
                recurringTransactions: rows,
                pagination: {
                    total: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get recurring transactions error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data transaksi berulang'
            });
        }
    },

    // Get recurring transaction by ID
    async getById(req, res) {
        try {
            const recurringTransaction = await RecurringTransaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                },
                include: [{
                    model: Transaction,
                    as: 'transactions',
                    order: [['date', 'DESC']]
                }]
            });

            if (!recurringTransaction) {
                return res.status(404).json({
                    error: 'Transaksi berulang tidak ditemukan'
                });
            }

            res.json({ recurringTransaction });
        } catch (error) {
            console.error('Get recurring transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data transaksi berulang'
            });
        }
    },

    // Update recurring transaction
    async update(req, res) {
        try {
            const recurringTransaction = await RecurringTransaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!recurringTransaction) {
                return res.status(404).json({
                    error: 'Transaksi berulang tidak ditemukan'
                });
            }

            // Update recurring transaction
            await recurringTransaction.update(req.body);

            // Recalculate next due date if frequency or dates changed
            if (req.body.frequency || req.body.startDate) {
                recurringTransaction.nextDue = recurringTransaction.calculateNextDue();
                await recurringTransaction.save();
            }

            res.json({
                message: 'Transaksi berulang berhasil diperbarui',
                recurringTransaction
            });
        } catch (error) {
            console.error('Update recurring transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat memperbarui transaksi berulang'
            });
        }
    },

    // Process recurring transaction manually
    async process(req, res) {
        try {
            const recurringTransaction = await RecurringTransaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                    status: 'ACTIVE'
                }
            });

            if (!recurringTransaction) {
                return res.status(404).json({
                    error: 'Transaksi berulang tidak ditemukan'
                });
            }

            const transaction = await recurringTransaction.process();

            res.json({
                message: 'Transaksi berulang berhasil diproses',
                transaction
            });
        } catch (error) {
            console.error('Process recurring transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat memproses transaksi berulang'
            });
        }
    },

    // Pause recurring transaction
    async pause(req, res) {
        try {
            const recurringTransaction = await RecurringTransaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                    status: 'ACTIVE'
                }
            });

            if (!recurringTransaction) {
                return res.status(404).json({
                    error: 'Transaksi berulang tidak ditemukan'
                });
            }

            await recurringTransaction.pause();

            res.json({
                message: 'Transaksi berulang berhasil dijeda',
                recurringTransaction
            });
        } catch (error) {
            console.error('Pause recurring transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat menjeda transaksi berulang'
            });
        }
    },

    // Resume recurring transaction
    async resume(req, res) {
        try {
            const recurringTransaction = await RecurringTransaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                    status: 'PAUSED'
                }
            });

            if (!recurringTransaction) {
                return res.status(404).json({
                    error: 'Transaksi berulang tidak ditemukan'
                });
            }

            await recurringTransaction.resume();

            res.json({
                message: 'Transaksi berulang berhasil dilanjutkan',
                recurringTransaction
            });
        } catch (error) {
            console.error('Resume recurring transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat melanjutkan transaksi berulang'
            });
        }
    },

    // Cancel recurring transaction
    async cancel(req, res) {
        try {
            const recurringTransaction = await RecurringTransaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                    status: {
                        [Op.in]: ['ACTIVE', 'PAUSED']
                    }
                }
            });

            if (!recurringTransaction) {
                return res.status(404).json({
                    error: 'Transaksi berulang tidak ditemukan'
                });
            }

            await recurringTransaction.cancel();

            res.json({
                message: 'Transaksi berulang berhasil dibatalkan',
                recurringTransaction
            });
        } catch (error) {
            console.error('Cancel recurring transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat membatalkan transaksi berulang'
            });
        }
    },

    // Delete recurring transaction
    async delete(req, res) {
        try {
            const recurringTransaction = await RecurringTransaction.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!recurringTransaction) {
                return res.status(404).json({
                    error: 'Transaksi berulang tidak ditemukan'
                });
            }

            await recurringTransaction.destroy();

            res.json({
                message: 'Transaksi berulang berhasil dihapus'
            });
        } catch (error) {
            console.error('Delete recurring transaction error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat menghapus transaksi berulang'
            });
        }
    }
};

module.exports = recurringTransactionController;
