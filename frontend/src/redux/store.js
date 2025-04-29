import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import transactionReducer from './slices/transactionSlice';
import budgetReducer from './slices/budgetSlice';
import goalReducer from './slices/goalSlice';
import chatGroupReducer from './slices/chatGroupSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    transactions: transactionReducer,
    budgets: budgetReducer,
    goals: goalReducer,
    chatGroups: chatGroupReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginSuccess', 'auth/registerSuccess'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
});

export default store;
