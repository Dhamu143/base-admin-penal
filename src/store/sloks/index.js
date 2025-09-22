import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- Axios instance ---
const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Async Thunks ---

// 🔄 MODIFIED: Thunk now accepts parameters and builds a dynamic URL
export const fetchSloks = createAsyncThunk(
  "sloks/fetchSloks",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Use URLSearchParams to easily build the query string (e.g., ?page=1&limit=10&language=...)
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/slok?${queryParams}`); // The API response nests the data, so we return the inner object
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Add a new slok
export const addSlok = createAsyncThunk(
  "sloks/addSlok",
  async (slokData, { rejectWithValue }) => {
    try {
      const response = await api.post("/slok/create", slokData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update an existing slok
export const updateSlok = createAsyncThunk(
  "sloks/updateSlok",
  async (slokData, { rejectWithValue }) => {
    try {
      const { id, ...data } = slokData;
      const response = await api.put(`/slok/${id}`, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete a slok
export const deleteSlok = createAsyncThunk(
  "sloks/deleteSlok",
  async (slokId, { rejectWithValue }) => {
    try {
      await api.delete(`/slok/${slokId}`);
      return slokId;
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

const sloksSlice = createSlice({
  name: "sloks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder // --- Fetch Sloks ---
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
      }) // --- Add Slok ---

      .addCase(addSlok.fulfilled, (state, action) => {
        // To avoid duplicating data, we let the component re-fetch the list
        // This ensures pagination remains correct.
        state.status = "idle"; // Trigger a re-fetch if needed
      }) // --- Update Slok ---
      .addCase(updateSlok.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (slok) => slok._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      }) // --- Delete Slok ---
      .addCase(deleteSlok.fulfilled, (state, action) => {
        state.list = state.list.filter((slok) => slok._id !== action.payload);
      });
  },
});

export default sloksSlice.reducer;
