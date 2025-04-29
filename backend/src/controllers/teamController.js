const { Team, TeamMember, User } = require('../models');

const teamController = {
    // Create a new team
    async create(req, res) {
        try {
            const { name, description } = req.body;
            const ownerId = req.user.id;

            if (!name) {
                return res.status(400).json({ error: 'Team name is required' });
            }

            const team = await Team.create({ name, description, ownerId });

            // Add owner as team member with OWNER role
            await TeamMember.create({
                teamId: team.id,
                userId: ownerId,
                role: 'OWNER',
                status: 'ACTIVE',
                joinedAt: new Date()
            });

            res.status(201).json({ message: 'Team created', team });
        } catch (error) {
            console.error('Create team error:', error);
            res.status(500).json({ error: 'Failed to create team' });
        }
    },

    // Get all teams owned or joined by user
    async getAll(req, res) {
        try {
            const userId = req.user.id;

            // Find teams where user is owner or member
            const ownedTeams = await Team.findAll({
                where: { ownerId: userId }
            });

            const memberTeams = await Team.findAll({
                include: [{
                    model: TeamMember,
                    as: 'members',
                    where: { userId, status: 'ACTIVE' }
                }]
            });

            // Combine and remove duplicates
            const teamsMap = new Map();
            ownedTeams.forEach(t => teamsMap.set(t.id, t));
            memberTeams.forEach(t => teamsMap.set(t.id, t));

            const teams = Array.from(teamsMap.values());

            res.json({ teams });
        } catch (error) {
            console.error('Get teams error:', error);
            res.status(500).json({ error: 'Failed to get teams' });
        }
    },

    // Get team by ID with members
    async getById(req, res) {
        try {
            const team = await Team.findOne({
                where: { id: req.params.id },
                include: [{
                    model: TeamMember,
                    as: 'members',
                    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'whatsappNumber'] }]
                }]
            });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            res.json({ team });
        } catch (error) {
            console.error('Get team error:', error);
            res.status(500).json({ error: 'Failed to get team' });
        }
    },

    // Update team info
    async update(req, res) {
        try {
            const team = await Team.findOne({ where: { id: req.params.id } });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            if (team.ownerId !== req.user.id) {
                return res.status(403).json({ error: 'Only team owner can update team' });
            }

            const { name, description } = req.body;
            if (name) team.name = name;
            if (description) team.description = description;

            await team.save();

            res.json({ message: 'Team updated', team });
        } catch (error) {
            console.error('Update team error:', error);
            res.status(500).json({ error: 'Failed to update team' });
        }
    },

    // Delete team
    async delete(req, res) {
        try {
            const team = await Team.findOne({ where: { id: req.params.id } });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            if (team.ownerId !== req.user.id) {
                return res.status(403).json({ error: 'Only team owner can delete team' });
            }

            await team.destroy();

            res.json({ message: 'Team deleted' });
        } catch (error) {
            console.error('Delete team error:', error);
            res.status(500).json({ error: 'Failed to delete team' });
        }
    },

    // Add member to team
    async addMember(req, res) {
        try {
            const team = await Team.findOne({ where: { id: req.params.id } });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            if (team.ownerId !== req.user.id) {
                return res.status(403).json({ error: 'Only team owner can add members' });
            }

            const { userId, role } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const existingMember = await TeamMember.findOne({
                where: { teamId: team.id, userId }
            });

            if (existingMember) {
                return res.status(400).json({ error: 'User is already a member' });
            }

            const member = await TeamMember.create({
                teamId: team.id,
                userId,
                role: role || 'MEMBER',
                status: 'PENDING',
                joinedAt: new Date()
            });

            res.status(201).json({ message: 'Member added', member });
        } catch (error) {
            console.error('Add member error:', error);
            res.status(500).json({ error: 'Failed to add member' });
        }
    },

    // Remove member from team
    async removeMember(req, res) {
        try {
            const team = await Team.findOne({ where: { id: req.params.id } });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            if (team.ownerId !== req.user.id) {
                return res.status(403).json({ error: 'Only team owner can remove members' });
            }

            const member = await TeamMember.findOne({
                where: { teamId: team.id, userId: req.params.userId }
            });

            if (!member) {
                return res.status(404).json({ error: 'Member not found' });
            }

            await member.destroy();

            res.json({ message: 'Member removed' });
        } catch (error) {
            console.error('Remove member error:', error);
            res.status(500).json({ error: 'Failed to remove member' });
        }
    }
};

module.exports = teamController;
