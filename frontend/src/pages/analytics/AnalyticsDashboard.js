import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactionStatistics } from '../../redux/slices/transactionSlice';
import { fetchBudgetStatistics } from '../../redux/slices/budgetSlice';
import { fetchGoalStatistics } from '../../redux/slices/goalSlice';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const transactionStats = useSelector(state => state.transactions.statistics);
  const budgetStats = useSelector(state => state.budgets.statistics);
  const goalStats = useSelector(state => state.goals.statistics);
  const isLoading = useSelector(state => state.transactions.isLoading || state.budgets.isLoading || state.goals.isLoading);

  useEffect(() => {
    dispatch(fetchTransactionStatistics());
    dispatch(fetchBudgetStatistics());
    dispatch(fetchGoalStatistics());
  }, [dispatch]);

  if (isLoading) {
    return <p>Loading analytics...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Financial Analytics</h1>

      {/* Transaction Statistics */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Transaction Statistics</h2>
        {transactionStats && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactionStats.dailyTotals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" name="Income" stroke="#00C49F" />
              <Line type="monotone" dataKey="total" name="Expense" stroke="#FF8042" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Budget Statistics */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Budget Statistics</h2>
        {budgetStats && (
          <BarChart width={600} height={300} data={budgetStats.budgets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="currentSpending" fill="#8884d8" name="Current Spending" />
            <Bar dataKey="amount" fill="#82ca9d" name="Budget Amount" />
          </BarChart>
        )}
      </section>

      {/* Goal Statistics */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Goal Statistics</h2>
        {goalStats && (
          <PieChart width={400} height={400}>
            <Pie
              data={goalStats.goals}
              dataKey="progress"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {goalStats.goals.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </section>
    </div>
  );
}

export default AnalyticsDashboard;
