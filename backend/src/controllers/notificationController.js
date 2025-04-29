const { Notification } = require('../models');
const { Op } = require('sequelize');

const notificationController = {
    // Create new notification
    async create(req, res) {
        try {
            const {
                type,
                title,
                message,
                priority,
                channels,
                scheduledFor,
                metadata
            } = req.body;

            if (!type || !title || !message) {
                return res.status(400).json({
                    error: 'Tipe, judul, dan pesan harus diisi'
                });
            }

            const notification = await Notification.create({
                userId: req.user.id,
                type,
                title,
                message,
                priority,
                channels,
                scheduledFor,
                metadata,
                status: 'UNREAD'
            });

            if (!scheduledFor) {
                await notification.send();
            }

            res.status(201).json({
                message: 'Notifikasi berhasil dibuat',
                notification
            });
        } catch (error) {
            console.error('Create notification error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat membuat notifikasi'
            });
        }
    },

    // Get all notifications
    async getAll(req, res) {
        try {
            const {
                type,
                status,
                priority,
                startDate,
                endDate,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = req.query;

            const where = { userId: req.user.id };
            if (type) where.type = type;
            if (status) where.status = status;
            if (priority) where.priority = priority;
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt[Op.gte] = new Date(startDate);
                if (endDate) where.createdAt[Op.lte] = new Date(endDate);
            }

            const { count, rows } = await Notification.findAndCountAll({
                where,
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: (page - 1) * limit
            });

            res.json({
                notifications: rows,
                pagination: {
                    total: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil data notifikasi'
            });
        }
    },

    // Get unread count
    async getUnreadCount(req, res) {
        try {
            const count = await Notification.count({
                where: {
                    userId: req.user.id,
                    status: 'UNREAD'
                }
            });

            res.json({ count });
        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil jumlah notifikasi belum dibaca'
            });
        }
    },

    // Mark as read
    async markAsRead(req, res) {
        try {
            const notification = await Notification.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!notification) {
                return res.status(404).json({
                    error: 'Notifikasi tidak ditemukan'
                });
            }

            await notification.markAsRead();

            res.json({
                message: 'Notifikasi telah ditandai sebagai dibaca',
                notification
            });
        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat menandai notifikasi sebagai dibaca'
            });
        }
    },

    // Mark all as read
    async markAllAsRead(req, res) {
        try {
            await Notification.update(
                {
                    status: 'READ',
                    readAt: new Date()
                },
                {
                    where: {
                        userId: req.user.id,
                        status: 'UNREAD'
                    }
                }
            );

            res.json({
                message: 'Semua notifikasi telah ditandai sebagai dibaca'
            });
        } catch (error) {
            console.error('Mark all as read error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat menandai semua notifikasi sebagai dibaca'
            });
        }
    },

    // Archive notification
    async archive(req, res) {
        try {
            const notification = await Notification.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!notification) {
                return res.status(404).json({
                    error: 'Notifikasi tidak ditemukan'
                });
            }

            await notification.archive();

            res.json({
                message: 'Notifikasi telah diarsipkan',
                notification
            });
        } catch (error) {
            console.error('Archive notification error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengarsipkan notifikasi'
            });
        }
    },

    // Delete notification
    async delete(req, res) {
        try {
            const notification = await Notification.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!notification) {
                return res.status(404).json({
                    error: 'Notifikasi tidak ditemukan'
                });
            }

            await notification.destroy();

            res.json({
                message: 'Notifikasi berhasil dihapus'
            });
        } catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat menghapus notifikasi'
            });
        }
    }
};

module.exports = notificationController;
