import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTransactions } from '../../redux/slices/transactionSlice';
import { fetchBudgets } from '../../redux/slices/budgetSlice';
import { fetchGoals } from '../../redux/slices/goalSlice';
import Widget from '../../components/dashboard/Widget';
import DarkModeToggle from '../../components/layout/DarkModeToggle';

function Dashboard() {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transactions.items);
  const budgets = useSelector((state) => state.budgets.items);
  const goals = useSelector((state) => state.goals.items);
  const [widgets, setWidgets] = useState([
    { id: 'transactions', title: 'Recent Transactions', visible: true },
    { id: 'budgets', title: 'Budgets Overview', visible: true },
    { id: 'goals', title: 'Financial Goals', visible: true },
  ]);

  useEffect(() => {
    dispatch(fetchTransactions({ limit: 5 }));
    dispatch(fetchBudgets({ limit: 5 }));
    dispatch(fetchGoals({ limit: 5 }));
  }, [dispatch]);

  const toggleWidget = (id) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DarkModeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {widgets.find((w) => w.id === 'transactions' && w.visible) && (
          <Widget title="Recent Transactions" onToggle={() => toggleWidget('transactions')}>
            {/* Render recent transactions */}
            <ul>
              {transactions.map((tx) => (
                <li key={tx.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <span>{tx.category}</span>
                    <span>{tx.amount}</span>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </Widget>
        )}

        {widgets.find((w) => w.id === 'budgets' && w.visible) && (
          <Widget title="Budgets Overview" onToggle={() => toggleWidget('budgets')}>
            {/* Render budgets overview */}
            <ul>
              {budgets.map((budget) => (
                <li key={budget.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <span>{budget.name}</span>
                    <span>{budget.currentSpending} / {budget.amount}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Widget>
        )}

        {widgets.find((w) => w.id === 'goals' && w.visible) && (
          <Widget title="Financial Goals" onToggle={() => toggleWidget('goals')}>
            {/* Render financial goals */}
            <ul>
              {goals.map((goal) => (
                <li key={goal.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <span>{goal.name}</span>
                    <span>{goal.currentAmount} / {goal.targetAmount}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Widget>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
