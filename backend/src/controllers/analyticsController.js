const { Transaction, Budget, FinancialGoal, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const analyticsController = {
    // Monthly spending and income report
    async monthlyReport(req, res) {
        try {
            const { user } = req;
            const { year } = req.query;
            const targetYear = year ? parseInt(year) : new Date().getFullYear();

            // Get monthly totals for income and expenses
            const monthlyTotals = await Transaction.findAll({
                attributes: [
                    [fn('EXTRACT', literal('MONTH FROM "date"')), 'month'],
                    'type',
                    [fn('SUM', col('amount')), 'total']
                ],
                where: {
                    userId: user.id,
                    date: {
                        [Op.gte]: new Date(targetYear, 0, 1),
                        [Op.lte]: new Date(targetYear, 11, 31)
                    }
                },
                group: ['month', 'type'],
                order: [[literal('month'), 'ASC']]
            });

            // Format data for charting
            const report = {
                income: Array(12).fill(0),
                expense: Array(12).fill(0)
            };

            monthlyTotals.forEach(row => {
                const monthIndex = parseInt(row.get('month')) - 1;
                if (row.type === 'INCOME') {
                    report.income[monthIndex] = parseFloat(row.get('total'));
                } else if (row.type === 'EXPENSE') {
                    report.expense[monthIndex] = parseFloat(row.get('total'));
                }
            });

            res.json({ year: targetYear, report });
        } catch (error) {
            console.error('Monthly report error:', error);
            res.status(500).json({ error: 'Failed to generate monthly report' });
        }
    },

    // Category spending trends
    async categoryTrends(req, res) {
        try {
            const { user } = req;
            const { months = 6 } = req.query;
            const monthsInt = parseInt(months);

            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - monthsInt);

            const trends = await Transaction.findAll({
                attributes: [
                    'category',
                    [fn('DATE_TRUNC', 'month', col('date')), 'month'],
                    [fn('SUM', col('amount')), 'total']
                ],
                where: {
                    userId: user.id,
                    type: 'EXPENSE',
                    date: {
                        [Op.gte]: startDate
                    }
                },
                group: ['category', 'month'],
                order: [['month', 'ASC']]
            });

            // Format data
            const formatted = {};
            trends.forEach(row => {
                const category = row.get('category');
                const month = row.get('month').toISOString().slice(0, 7);
                const total = parseFloat(row.get('total'));
                if (!formatted[category]) {
                    formatted[category] = {};
                }
                formatted[category][month] = total;
            });

            res.json({ months: monthsInt, trends: formatted });
        } catch (error) {
            console.error('Category trends error:', error);
            res.status(500).json({ error: 'Failed to generate category trends' });
        }
    },

    // Predictive analytics for spending
    async spendingPrediction(req, res) {
        try {
            const { user } = req;
            // For simplicity, use average monthly spending as prediction
            const avgSpending = await Transaction.findOne({
                attributes: [[fn('AVG', col('amount')), 'avgAmount']],
                where: {
                    userId: user.id,
                    type: 'EXPENSE'
                }
            });

            const prediction = avgSpending ? parseFloat(avgSpending.get('avgAmount')) : 0;

            res.json({ prediction });
        } catch (error) {
            console.error('Spending prediction error:', error);
            res.status(500).json({ error: 'Failed to generate spending prediction' });
        }
    }
};

module.exports = analyticsController;
