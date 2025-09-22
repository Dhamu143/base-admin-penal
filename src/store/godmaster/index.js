// src/store/godmaster/godsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- Async Thunks ---

// 🔄 MODIFIED: Thunk now accepts parameters for pagination
export const fetchGods = createAsyncThunk(
  "gods/fetchGods",
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      // Use URLSearchParams to build the query string (e.g., /godmaster?page=1&limit=10)
      const queryParams = new URLSearchParams(params).toString();
      const response = await httpService.get(`/godmaster?${queryParams}`);
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
      const response = await httpService.post("/godmaster/create", godData);
      return response.data.data;
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
      const response = await httpService.put(`/godmaster/${id}`, data);
      return response.data.data;
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
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  },
  status: "idle",
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
      // This reducer was already correctly set up to handle a paginated response!
      .addCase(fetchGods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload?.data?.data || [];
        state.pagination = action.payload?.data?.pagination || {
          totalPages: 1,
        };
      })
      .addCase(fetchGods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      // Other cases remain the same...
      .addCase(addGod.fulfilled, (state, action) => {
        // To keep pagination correct, we don't manually add to the list.
        // We'll trigger a refetch in the component instead.
        state.status = "idle";
      })
      .addCase(updateGod.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (god) => god._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload };
        }
      })
      .addCase(deleteGod.fulfilled, (state, action) => {
        state.list = state.list.filter((god) => god._id !== action.payload);
      });
  },
});

export default godsSlice.reducer;
