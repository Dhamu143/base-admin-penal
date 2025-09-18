// src/store/godmaster/godSlice.js
// (Or wherever you prefer to keep your slices)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Create a single, reusable axios instance for this API
const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
});

// --- ASYNC THUNKS (API Logic is defined here) ---

/**
 * Fetch all Gods
 * GET /god
 */
export const fetchGods = createAsyncThunk(
  "god/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/god");
      // Extracts the list from: { success: true, data: { data: [...] } }
      return response.data.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch gods."
      );
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
      const response = await api.post("/god/create", godData);
      // Extracts the new god object from: { success: true, data: { ... } }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add god."
      );
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
      const response = await api.put(`/god/${id}`, godData);
      // Extracts the updated god object from: { success: true, data: { ... } }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update god."
      );
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
      await api.delete(`/god/${id}`);
      // Return the ID on success for filtering in the reducer
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete god."
      );
    }
  }
);

// --- SLICE DEFINITION (State Management Logic) ---

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
      // --- Fetch Gods Cases ---
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

      // --- Add God Cases ---
      .addCase(addGod.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Add the new god to the list for a fast UI update without a refetch
        state.list.push(action.payload);
      })
      .addCase(addGod.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Update God Cases ---
      .addCase(updateGod.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Find the god in the list and update it for a fast UI update
        const index = state.list.findIndex(
          (god) => god._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateGod.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Delete God Cases ---
      .addCase(deleteGod.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Immediately remove the item from the list for a fast UI update
        state.list = state.list.filter((god) => god._id !== action.payload);
      })
      .addCase(deleteGod.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default godSlice.reducer;
