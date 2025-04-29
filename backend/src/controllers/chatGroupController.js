const { ChatGroup, ChatMessage, User } = require('../models');

const chatGroupController = {
    // Create a new chat group
    async create(req, res) {
        try {
            const { name, description } = req.body;
            const ownerId = req.user.id;

            if (!name) {
                return res.status(400).json({ error: 'Group name is required' });
            }

            const group = await ChatGroup.create({ name, description, ownerId });

            res.status(201).json({ message: 'Chat group created', group });
        } catch (error) {
            console.error('Create chat group error:', error);
            res.status(500).json({ error: 'Failed to create chat group' });
        }
    },

    // Get all chat groups owned or joined by user
    async getAll(req, res) {
        try {
            const userId = req.user.id;

            // Find groups where user is owner or has sent messages
            const ownedGroups = await ChatGroup.findAll({
                where: { ownerId: userId }
            });

            const memberGroups = await ChatGroup.findAll({
                include: [{
                    model: ChatMessage,
                    as: 'messages',
                    where: { senderId: userId }
                }]
            });

            // Combine and remove duplicates
            const groupsMap = new Map();
            ownedGroups.forEach(g => groupsMap.set(g.id, g));
            memberGroups.forEach(g => groupsMap.set(g.id, g));

            const groups = Array.from(groupsMap.values());

            res.json({ groups });
        } catch (error) {
            console.error('Get chat groups error:', error);
            res.status(500).json({ error: 'Failed to get chat groups' });
        }
    },

    // Get chat group by ID with messages
    async getById(req, res) {
        try {
            const group = await ChatGroup.findOne({
                where: { id: req.params.id },
                include: [{
                    model: ChatMessage,
                    as: 'messages',
                    include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'whatsappNumber'] }],
                    order: [['createdAt', 'ASC']]
                }]
            });

            if (!group) {
                return res.status(404).json({ error: 'Chat group not found' });
            }

            res.json({ group });
        } catch (error) {
            console.error('Get chat group error:', error);
            res.status(500).json({ error: 'Failed to get chat group' });
        }
    },

    // Send message in chat group
    async sendMessage(req, res) {
        try {
            const group = await ChatGroup.findOne({ where: { id: req.params.id } });
            if (!group) {
                return res.status(404).json({ error: 'Chat group not found' });
            }

            const { content, type } = req.body;
            if (!content) {
                return res.status(400).json({ error: 'Message content is required' });
            }

            const message = await ChatMessage.create({
                groupId: group.id,
                senderId: req.user.id,
                content,
                type: type || 'TEXT'
            });

            res.status(201).json({ message: 'Message sent', message });
        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    },

    // Delete message
    async deleteMessage(req, res) {
        try {
            const message = await ChatMessage.findOne({
                where: { id: req.params.messageId, senderId: req.user.id }
            });

            if (!message) {
                return res.status(404).json({ error: 'Message not found or not authorized' });
            }

            await message.destroy();

            res.json({ message: 'Message deleted' });
        } catch (error) {
            console.error('Delete message error:', error);
            res.status(500).json({ error: 'Failed to delete message' });
        }
    }
};

module.exports = chatGroupController;
