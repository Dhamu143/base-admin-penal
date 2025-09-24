// store/ringtone/index.js (ringtoneSlice.js)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import HttpService from "../../common/http.service";

// --- Async Thunks ---

// Fetch ringtones (with filters & pagination)
export const fetchRingtones = createAsyncThunk(
  "ringtones/fetchRingtones",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await HttpService.get("/ringtone", params);

      return {
        data: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || {},
      };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch ringtones");
    }
  }
);

// Add a new ringtone
export const addRingtone = createAsyncThunk(
  "ringtones/addRingtone",
  async (ringtoneFormData, { rejectWithValue }) => {
    try {
      const response = await HttpService.post(
        "/ringtone/create",
        {},
        ringtoneFormData,
        { "Content-Type": "multipart/form-data" }
      );
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to add ringtone");
    }
  }
);

// Update an existing ringtone
export const updateRingtone = createAsyncThunk(
  "ringtones/updateRingtone",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await HttpService.put(`/ringtone/${id}`, {}, data, {
        "Content-Type": "multipart/form-data",
      });
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update ringtone");
    }
  }
);

// Delete a ringtone
export const deleteRingtone = createAsyncThunk(
  "ringtones/deleteRingtone",
  async (ringtoneId, { rejectWithValue }) => {
    try {
      await HttpService.delete(`/ringtone/${ringtoneId}`);
      return ringtoneId;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete ringtone");
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
