// store/ringtone/index.js (ringtoneSlice.js)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
});

// --- Async Thunks ---

// Fetch ringtones (with filters & pagination)
export const fetchRingtones = createAsyncThunk(
  "ringtones/fetchRingtones",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string (skip empty values)
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();

      const url = queryString ? `/ringtone?${queryString}` : "/ringtone";

      const response = await api.get(url);

      return {
        data: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || {},
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Add a new ringtone
export const addRingtone = createAsyncThunk(
  "ringtones/addRingtone",
  async (ringtoneFormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/ringtone/create", ringtoneFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update an existing ringtone
export const updateRingtone = createAsyncThunk(
  "ringtones/updateRingtone",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/ringtone/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete a ringtone
export const deleteRingtone = createAsyncThunk(
  "ringtones/deleteRingtone",
  async (ringtoneId, { rejectWithValue }) => {
    try {
      await api.delete(`/ringtone/${ringtoneId}`);
      return ringtoneId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Slice Definition ---
const initialState = {
  list: [],
  pagination: {}, // for page, totalPages, limit etc.
  status: "idle", // 'idle', 'loading', 'succeeded', 'failed'
  error: null,
};

const ringtoneSlice = createSlice({
  name: "ringtones",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchRingtones.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRingtones.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRingtones.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Add ---
      .addCase(addRingtone.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // --- Update ---
      .addCase(updateRingtone.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })

      // --- Delete ---
      .addCase(deleteRingtone.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r._id !== action.payload);
      });
  },
});

export default ringtoneSlice.reducer;
