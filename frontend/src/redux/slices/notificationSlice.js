import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.items.push(notification);
      state.unreadCount += 1;
    },
    removeNotification: (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        if (!state.items[index].read) {
          state.unreadCount -= 1;
        }
        state.items.splice(index, 1);
      }
    },
    markAsRead: (state, action) => {
      const notification = state.items.find(
        (item) => item.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((item) => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    clearAll: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    // Add notification from WebSocket or server-sent event
    receiveNotification: (state, action) => {
      const notification = {
        id: action.payload.id || Date.now(),
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.items.push(notification);
      state.unreadCount += 1;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearAll,
  receiveNotification,
} = notificationSlice.actions;

// Thunk for showing a notification for a specified duration
export const showNotification = (notification, duration = 5000) => (dispatch) => {
  const id = Date.now();
  dispatch(
    addNotification({
      id,
      ...notification,
    })
  );

  setTimeout(() => {
    dispatch(removeNotification(id));
  }, duration);
};

export default notificationSlice.reducer;
