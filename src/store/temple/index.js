import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Create a reusable axios instance
const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
});

// --- ASYNC THUNKS (API Logic) ---

export const fetchTemples = createAsyncThunk(
  "temple/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/temple");
      // Extracts the list from: { data: { data: [...] } }
      return response.data.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch temples."
      );
    }
  }
);

export const addTemple = createAsyncThunk(
  "temple/add",
  async (templeData, { rejectWithValue }) => {
    try {
      // CHANGED: The API endpoint for creating a temple is now correct.
      const response = await api.post("/temple/create", templeData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add temple."
      );
    }
  }
);

export const updateTemple = createAsyncThunk(
  "temple/update",
  async ({ id, ...templeData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/temple/${id}`, templeData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update temple."
      );
    }
  }
);

export const deleteTemple = createAsyncThunk(
  "temple/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/temple/${id}`);
      return id; // Return the ID for filtering in the reducer
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete temple."
      );
    }
  }
);

// --- SLICE DEFINITION ---

const templeSlice = createSlice({
  name: "temple",
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Handle Specific Fulfilled Cases First ---
      .addCase(fetchTemples.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(addTemple.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list.push(action.payload); // Fast UI update
      })
      .addCase(updateTemple.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.list.findIndex(
          (temple) => temple._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload; // Fast UI update
        }
      })
      .addCase(deleteTemple.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = state.list.filter(
          (temple) => temple._id !== action.payload
        ); // Fast UI update
      })
      // --- General Matchers Now Placed at the End ---
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      );
  },
});

export default templeSlice.reducer;
