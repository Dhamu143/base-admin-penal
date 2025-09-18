// godsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- Axios instance ---
const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api", // replace with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Async Thunks ---

// Fetch all gods
export const fetchGods = createAsyncThunk(
  "gods/fetchGods",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/godmaster");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Add a new god
export const addGod = createAsyncThunk(
  "gods/addGod",
  async (godData, { rejectWithValue }) => {
    try {
      const response = await api.post("/godmaster/create", godData); // updated endpoint
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update existing god
export const updateGod = createAsyncThunk(
  "gods/updateGod",
  async (godData, { rejectWithValue }) => {
    try {
      const { id, ...data } = godData;
      const response = await api.put(`/godmaster/${id}`, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete a god
export const deleteGod = createAsyncThunk(
  "gods/deleteGod",
  async (godId, { rejectWithValue }) => {
    try {
      await api.delete(`/godmaster/${godId}`);
      return godId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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

const godsSlice = createSlice({
  name: "gods",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchGods.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data || [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchGods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // Add
      .addCase(addGod.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addGod.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // Update
      .addCase(updateGod.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (god) => god._id === action.payload._id
        );
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateGod.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // Delete
      .addCase(deleteGod.fulfilled, (state, action) => {
        state.list = state.list.filter((god) => god._id !== action.payload);
      })
      .addCase(deleteGod.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default godsSlice.reducer;
