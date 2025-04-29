# WhatsApp Financial Management Bot - Backend

## Overview
Backend service for WhatsApp Financial Management Bot that provides comprehensive financial management solutions through WhatsApp and web interfaces. The system includes transaction management, budget tracking, financial goals, recurring transactions, and notifications.

## Features
- User authentication and authorization
- Transaction management with categories and analytics
- Budget tracking and alerts
- Financial goals with milestone tracking
- Recurring transactions with automatic processing
- WhatsApp bot integration with NLP
- Multi-channel notifications (WhatsApp & Email)
- Real-time financial analytics

## Tech Stack
- Node.js & Express.js
- PostgreSQL with Sequelize ORM
- WhatsApp Web.js for bot integration
- NLP.js for natural language processing
- JWT for authentication
- Jest for testing

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- WhatsApp account for bot integration

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd whatsapp-finance-bot/backend
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```bash
cp .env.example .env
```

4. Update environment variables in .env file
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=whatsapp_finance
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

WHATSAPP_SESSION_DATA_PATH=./whatsapp-session
```

5. Create database
```bash
createdb whatsapp_finance
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile
- PUT /api/auth/change-password - Change password

### Transactions
- POST /api/transactions - Create transaction
- GET /api/transactions - Get all transactions
- GET /api/transactions/:id - Get transaction by ID
- PUT /api/transactions/:id - Update transaction
- DELETE /api/transactions/:id - Delete transaction
- GET /api/transactions/statistics - Get transaction statistics

### Budgets
- POST /api/budgets - Create budget
- GET /api/budgets - Get all budgets
- GET /api/budgets/:id - Get budget by ID
- PUT /api/budgets/:id - Update budget
- DELETE /api/budgets/:id - Delete budget
- GET /api/budgets/statistics - Get budget statistics

### Financial Goals
- POST /api/goals - Create goal
- GET /api/goals - Get all goals
- GET /api/goals/:id - Get goal by ID
- PUT /api/goals/:id - Update goal
- DELETE /api/goals/:id - Delete goal
- POST /api/goals/:id/progress - Update goal progress
- GET /api/goals/statistics - Get goal statistics

### Recurring Transactions
- POST /api/recurring-transactions - Create recurring transaction
- GET /api/recurring-transactions - Get all recurring transactions
- GET /api/recurring-transactions/:id - Get recurring transaction by ID
- PUT /api/recurring-transactions/:id - Update recurring transaction
- DELETE /api/recurring-transactions/:id - Delete recurring transaction
- POST /api/recurring-transactions/:id/process - Process recurring transaction
- PUT /api/recurring-transactions/:id/pause - Pause recurring transaction
- PUT /api/recurring-transactions/:id/resume - Resume recurring transaction
- PUT /api/recurring-transactions/:id/cancel - Cancel recurring transaction

### Notifications
- POST /api/notifications - Create notification
- GET /api/notifications - Get all notifications
- GET /api/notifications/unread-count - Get unread notifications count
- PUT /api/notifications/:id/read - Mark notification as read
- PUT /api/notifications/read-all - Mark all notifications as read
- PUT /api/notifications/:id/archive - Archive notification
- DELETE /api/notifications/:id - Delete notification

### WhatsApp Bot Commands

1. Record Expense:
```
catat pengeluaran [jumlah] untuk [kategori]
Example: catat pengeluaran 50000 untuk makan
```

2. Record Income:
```
catat pemasukan [jumlah] dari [kategori]
Example: catat pemasukan 1000000 dari gaji
```

3. Check Budget:
```
cek budget [kategori]
Example: cek budget makan
```

4. Check Goal:
```
cek target [nama target]
Example: cek target tabungan rumah
```

5. Help:
```
bantuan
```

## Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   ├── notificationController.js
│   │   ├── recurringTransactionController.js
│   │   └── transactionController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Budget.js
│   │   ├── FinancialGoal.js
│   │   ├── Notification.js
│   │   ├── RecurringTransaction.js
│   │   ├── Transaction.js
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── recurringTransactionRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── index.js
│   ├── services/
│   │   ├── notificationService.js
│   │   ├── recurringTransactionService.js
│   │   └── whatsappBot.js
│   └── app.js
├── .env.example
├── package.json
└── README.md
```

## Testing
```bash
npm test
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
MIT
