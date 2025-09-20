// src/store/godmaster/godSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- ASYNC THUNKS ---

/**
 * Fetch all Gods
 * GET /god
 */
export const fetchGods = createAsyncThunk(
  "god/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpService.get("/god");
      // API response: { success: true, data: { data: [...] } }
      return response.data.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not fetch gods.");
    }
  }
);

/**
 * Add a new God
 * POST /god/create
 */
export const addGod = createAsyncThunk(
  "god/add",
  async (godData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/god/create", {}, godData);
      return response.data.data; // new god object
    } catch (err) {
      return rejectWithValue(err.message || "Could not add god.");
    }
  }
);

/**
 * Update an existing God
 * PUT /god/:id
 */
export const updateGod = createAsyncThunk(
  "god/update",
  async ({ id, ...godData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/god/${id}`, {}, godData);
      return response.data.data; // updated god object
    } catch (err) {
      return rejectWithValue(err.message || "Could not update god.");
    }
  }
);

/**
 * Delete a God
 * DELETE /god/:id
 */
export const deleteGod = createAsyncThunk(
  "god/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/god/${id}`);
      return id; // return id to remove from state
    } catch (err) {
      return rejectWithValue(err.message || "Could not delete god.");
    }
  }
);

// --- SLICE ---
const godSlice = createSlice({
  name: "god",
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchGods.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchGods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Add ---
      .addCase(addGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list.push(action.payload);
      })

      // --- Update ---
      .addCase(updateGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.list.findIndex(
          (god) => god._id === action.payload._id
        );
        if (index !== -1) {
          // Merge old object with updated fields
          state.list[index] = { ...state.list[index], ...action.payload };
        }
      })

      // --- Delete ---
      .addCase(deleteGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = state.list.filter((god) => god._id !== action.payload);
      });
  },
});

export default godSlice.reducer;
