// src/store/godmaster/godsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- Async Thunks ---

// Fetch all gods
export const fetchGods = createAsyncThunk(
  "gods/fetchGods",
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpService.get("/godmaster");
      // Assuming API returns: { success: true, data: { data: [...], pagination: {...} } }
      return response.data; // return whole response.data
    } catch (err) {
      return rejectWithValue(err.message || "Could not fetch gods.");
    }
  }
);

// Add a new god
export const addGod = createAsyncThunk(
  "gods/addGod",
  async (godData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/godmaster/create", {}, godData);
      return response.data.data; // return created god object
    } catch (err) {
      return rejectWithValue(err.message || "Could not add god.");
    }
  }
);

// Update existing god
export const updateGod = createAsyncThunk(
  "gods/updateGod",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/godmaster/${id}`, {}, data);
      return response.data.data; // return updated god object
    } catch (err) {
      return rejectWithValue(err.message || "Could not update god.");
    }
  }
);

// Delete a god
export const deleteGod = createAsyncThunk(
  "gods/deleteGod",
  async (godId, { rejectWithValue }) => {
    try {
      await httpService.delete(`/godmaster/${godId}`);
      return godId;
    } catch (err) {
      return rejectWithValue(err.message || "Could not delete god.");
    }
  }
);

// --- Slice ---
const initialState = {
  list: [],
  pagination: {},
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const godsSlice = createSlice({
  name: "gods",
  initialState,
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
        // Correct mapping from API response
        state.list = action.payload?.data?.data || [];
        state.pagination = action.payload?.data?.pagination || {};
      })
      .addCase(fetchGods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // --- Add ---
      .addCase(addGod.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addGod.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // --- Update ---
      .addCase(updateGod.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (god) => god._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload };
        }
      })
      .addCase(updateGod.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // --- Delete ---
      .addCase(deleteGod.fulfilled, (state, action) => {
        state.list = state.list.filter((god) => god._id !== action.payload);
      })
      .addCase(deleteGod.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default godsSlice.reducer;
