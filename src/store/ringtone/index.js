// store/ringtone/index.js (or ringtoneSlice.js)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
});

// --- REMOVED: The buildFormData helper is not needed ---

// --- Async Thunks ---

export const fetchRingtones = createAsyncThunk(
  "ringtones/fetchRingtones",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/ringtone");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Add a new ringtone
export const addRingtone = createAsyncThunk(
  "ringtones/addRingtone",
  // CHANGED: The first argument 'ringtoneFormData' is already the FormData object. Use it directly.
  async (ringtoneFormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/ringtone/create", ringtoneFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update an existing ringtone
export const updateRingtone = createAsyncThunk(
  "ringtones/updateRingtone",
  // CHANGED: Destructure the payload to get id and data (which is the FormData object). Use 'data' directly.
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/ringtone/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
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
  pagination: {},
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
      })
      .addCase(fetchRingtones.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data || [];
        state.pagination = action.payload.pagination || {};
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
