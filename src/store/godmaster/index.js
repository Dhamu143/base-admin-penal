// src/store/godmaster/godsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- Async Thunks ---

// ✅ Fetch gods with pagination + filters
export const fetchGods = createAsyncThunk(
  "gods/fetchGods",
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      // MODIFIED: Pass the params object directly to the httpService.get method.
      // It will handle converting it to a query string as per its design.
      const response = await httpService.get("/godmaster", params);
      return response.data; // expected to include { data: { data: [], pagination: {...} } }
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
      // MODIFIED: Pass an empty object {} for 'params' and godData for 'payload' (the body).
      const response = await httpService.post("/godmaster/create", {}, godData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not add god.");
    }
  }
);

// ✅ Update existing god
export const updateGod = createAsyncThunk(
  "gods/updateGod",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      // MODIFIED: Pass an empty object {} for 'params' and the rest of the data for 'payload' (the body).
      const response = await httpService.put(`/godmaster/${id}`, {}, data);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not update god.");
    }
  }
);

// ✅ Delete a god
export const deleteGod = createAsyncThunk(
  "gods/deleteGod",
  async (godId, { rejectWithValue }) => {
    try {
      // NO CHANGE NEEDED: The godId is in the URL, and there is no body/payload.
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
    limit: 10,
  },
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const godsSlice = createSlice({
  name: "gods",
  initialState,
  reducers: {
    resetGodsState: () => initialState, // ✅ handy for logout/reset
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchGods.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload?.data?.data || [];
        state.pagination = {
          ...state.pagination,
          ...action.payload?.data?.pagination,
        };
      })
      .addCase(fetchGods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // --- Add ---
      .addCase(addGod.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addGod.fulfilled, (state) => {
        // ⚡️ We won't push into list to avoid pagination mismatch
        state.status = "succeeded";
      })
      .addCase(addGod.rejected, (state, action) => {
        state.status = "failed";
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

      // --- Delete ---
      .addCase(deleteGod.fulfilled, (state, action) => {
        state.list = state.list.filter((god) => god._id !== action.payload);
      });
  },
});

export const { resetGodsState } = godsSlice.actions;
export default godsSlice.reducer;
