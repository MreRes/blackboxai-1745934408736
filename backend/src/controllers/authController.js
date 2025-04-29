const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const authController = {
    // Register new user
    async register(req, res) {
        try {
            const { name, email, password, whatsappNumber } = req.body;

            // Validate input
            if (!name || !email || !password || !whatsappNumber) {
                return res.status(400).json({
                    error: 'Semua field harus diisi'
                });
            }

            // Check if email already exists
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({
                    error: 'Email sudah terdaftar'
                });
            }

            // Check if WhatsApp number already exists
            const existingWhatsApp = await User.findOne({ where: { whatsappNumber } });
            if (existingWhatsApp) {
                return res.status(400).json({
                    error: 'Nomor WhatsApp sudah terdaftar'
                });
            }

            // Create user
            const user = await User.create({
                name,
                email,
                password, // Will be hashed by model hook
                whatsappNumber,
                preferences: {
                    currency: 'IDR',
                    language: 'id',
                    notifications: {
                        email: true,
                        whatsapp: true
                    }
                }
            });

            // Generate token
            const token = generateToken(user);

            res.status(201).json({
                message: 'Registrasi berhasil',
                user: user.toPublicJSON(),
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat registrasi'
            });
        }
    },

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email dan password harus diisi'
                });
            }

            // Find user
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({
                    error: 'Email atau password salah'
                });
            }

            // Validate password
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Email atau password salah'
                });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token
            const token = generateToken(user);

            res.json({
                message: 'Login berhasil',
                user: user.toPublicJSON(),
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat login'
            });
        }
    },

    // Get current user profile
    async getProfile(req, res) {
        try {
            const user = await User.findByPk(req.user.id);
            res.json({
                user: user.toPublicJSON()
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengambil profil'
            });
        }
    },

    // Update user profile
    async updateProfile(req, res) {
        try {
            const { name, email, whatsappNumber, preferences } = req.body;
            const user = await User.findByPk(req.user.id);

            // Update fields if provided
            if (name) user.name = name;
            if (email && email !== user.email) {
                // Check if new email already exists
                const existingEmail = await User.findOne({ where: { email } });
                if (existingEmail) {
                    return res.status(400).json({
                        error: 'Email sudah digunakan'
                    });
                }
                user.email = email;
                user.isVerified = false; // Require re-verification for new email
            }
            if (whatsappNumber && whatsappNumber !== user.whatsappNumber) {
                // Check if new WhatsApp number already exists
                const existingWhatsApp = await User.findOne({ where: { whatsappNumber } });
                if (existingWhatsApp) {
                    return res.status(400).json({
                        error: 'Nomor WhatsApp sudah digunakan'
                    });
                }
                user.whatsappNumber = whatsappNumber;
            }
            if (preferences) {
                user.preferences = {
                    ...user.preferences,
                    ...preferences
                };
            }

            await user.save();

            res.json({
                message: 'Profil berhasil diperbarui',
                user: user.toPublicJSON()
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat memperbarui profil'
            });
        }
    },

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            // Validate input
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Password lama dan baru harus diisi'
                });
            }

            const user = await User.findByPk(req.user.id);

            // Validate current password
            const isValidPassword = await user.validatePassword(currentPassword);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Password lama salah'
                });
            }

            // Update password
            user.password = newPassword; // Will be hashed by model hook
            await user.save();

            res.json({
                message: 'Password berhasil diubah'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                error: 'Terjadi kesalahan saat mengubah password'
            });
        }
    }
};

module.exports = authController;
