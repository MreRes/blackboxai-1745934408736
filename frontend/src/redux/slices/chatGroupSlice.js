import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchChatGroups = createAsyncThunk(
  'chatGroups/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await api.get('/chat-groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.groups;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchChatGroupById = createAsyncThunk(
  'chatGroups/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await api.get(`/chat-groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.group;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chatGroups/sendMessage',
  async ({ groupId, content, type }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await api.post(
        `/chat-groups/${groupId}/messages`,
        { content, type },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const chatGroupSlice = createSlice({
  name: 'chatGroups',
  initialState: {
    groups: [],
    currentGroup: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentGroup(state) {
      state.currentGroup = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchChatGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch chat groups';
      })
      .addCase(fetchChatGroupById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatGroupById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchChatGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch chat group';
      })
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.currentGroup) {
          state.currentGroup.messages.push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload?.error || 'Failed to send message';
      });
  },
});

export const { clearCurrentGroup, clearError } = chatGroupSlice.actions;

export default chatGroupSlice.reducer;
