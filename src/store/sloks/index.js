import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import HttpService from "../../common/http.service";

// --- Async Thunks ---

export const fetchSloks = createAsyncThunk(
  "sloks/fetchSloks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await HttpService.get("/slok", params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch sloks");
    }
  }
);

export const addSlok = createAsyncThunk(
  "sloks/addSlok",
  async (slokData, { rejectWithValue }) => {
    try {
      const response = await HttpService.post("/slok/create", {}, slokData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to add slok");
    }
  }
);

export const updateSlok = createAsyncThunk(
  "sloks/updateSlok",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await HttpService.put(`/slok/${id}`, {}, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update slok");
    }
  }
);

export const deleteSlok = createAsyncThunk(
  "sloks/deleteSlok",
  async (slokId, { rejectWithValue }) => {
    try {
      await HttpService.delete(`/slok/${slokId}`);
      return slokId;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete slok");
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

const sloksSlice = createSlice({
  name: "sloks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch Sloks ---
      .addCase(fetchSloks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSloks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data || [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchSloks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch sloks";
      })
      // --- Add Slok ---
      .addCase(addSlok.fulfilled, (state) => {
        state.status = "idle"; // Trigger a re-fetch if needed
      })
      // --- Update Slok ---
      .addCase(updateSlok.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (slok) => slok._id === action.payload._id
        );
        if (index !== -1) state.list[index] = action.payload;
      })
      // --- Delete Slok ---
      .addCase(deleteSlok.fulfilled, (state, action) => {
        state.list = state.list.filter((slok) => slok._id !== action.payload);
      });
  },
});

export default sloksSlice.reducer;
