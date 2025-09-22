import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service"; // 🔄 MODIFIED: Using consistent httpService

// --- ASYNC THUNKS ---

// 🔄 MODIFIED: Thunk now accepts params for pagination and filtering
export const fetchFestivals = createAsyncThunk(
  "festivals/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();

      const url = queryString ? `/festival?${queryString}` : "/festival";
      const response = await httpService.get(url);
      
      // 🔄 MODIFIED: Return the whole payload for the reducer
      return response.data?.data; // Expects { data: [...], pagination: {...} }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch festivals.");
    }
  }
);

export const addFestival = createAsyncThunk(
  "festivals/add",
  async (festivalData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/festival/create", {}, festivalData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add festival.");
    }
  }
);

export const updateFestival = createAsyncThunk(
  "festivals/update",
  async ({ id, ...festivalData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/festival/${id}`, {}, festivalData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update festival.");
    }
  }
);

export const deleteFestival = createAsyncThunk(
  "festivals/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/festival/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete festival.");
    }
  }
);

const festivalSlice = createSlice({
  name: "festivals",
  initialState: {
    list: [],
    pagination: null, // ✨ NEW: Add pagination to state
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFestivals.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFestivals.fulfilled, (state, action) => {
        state.status = "succeeded";
        // 🔄 MODIFIED: Correctly handle paginated response
        state.list = Array.isArray(action.payload?.data) ? action.payload.data : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchFestivals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })
      .addCase(addFestival.fulfilled, (state, action) => {
        // Optimistic update
        state.list.unshift(action.payload);
      })
      .addCase(updateFestival.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteFestival.fulfilled, (state, action) => {
        state.list = state.list.filter((f) => f._id !== action.payload);
      });
  },
});

export default festivalSlice.reducer;