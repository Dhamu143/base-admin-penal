// src/store/mantra/index.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- ASYNC THUNKS FOR THE /mantra ENDPOINT ---

// Fetch all mantras with optional filters & pagination
export const fetchMantras = createAsyncThunk(
  "mantra/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();

      const url = queryString ? `/mantra?${queryString}` : "/mantra";
      const response = await httpService.get(url);

      return {
        data: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch mantras."
      );
    }
  }
);

// Add new mantra
export const addMantra = createAsyncThunk(
  "mantra/add",
  async (mantraData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/mantra/create", {}, mantraData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add mantra."
      );
    }
  }
);

// Update mantra
export const updateMantra = createAsyncThunk(
  "mantra/update",
  async ({ id, ...mantraData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/mantra/${id}`, {}, mantraData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update mantra."
      );
    }
  }
);

// Delete mantra
export const deleteMantra = createAsyncThunk(
  "mantra/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/mantra/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete mantra."
      );
    }
  }
);

// --- SLICE ---
const mantraSlice = createSlice({
  name: "mantras",
  initialState: {
    list: [],
    pagination: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMantras.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMantras.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchMantras.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addMantra.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addMantra.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateMantra.fulfilled, (state, action) => {
        const index = state.list.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateMantra.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteMantra.fulfilled, (state, action) => {
        state.list = state.list.filter((m) => m._id !== action.payload);
      })
      .addCase(deleteMantra.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default mantraSlice.reducer;
