import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

// --- Async Thunks ---

// 🔄 MODIFIED: Now accepts a 'params' object for pagination and filtering
export const fetchBhajans = createAsyncThunk(
  "bhajans/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();

      const url = queryString ? `/bhajan?${queryString}` : "/bhajan";
      const response = await httpService.get(url);

      // Expecting API response: { data: { data: [...], pagination: {...} } }
      return response.data?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const addBhajan = createAsyncThunk(
  "bhajans/add",
  async (bhajanData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/bhajan/create", {}, bhajanData);
      return response.data?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const updateBhajan = createAsyncThunk(
  "bhajans/update",
  async ({ id, ...bhajanData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/bhajan/${id}`, {}, bhajanData);
      return response.data?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const deleteBhajan = createAsyncThunk(
  "bhajans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/bhajan/${id}`);
      return id;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

// --- Slice ---
export const bhajanSlice = createSlice({
  name: "bhajans",
  initialState: {
    list: [],
    pagination: null, // ✨ NEW: State for pagination data
    status: "idle",
    error: null,
    // 🗑️ REMOVED: Filters are no longer needed in Redux state
  },
  reducers: {
    // 🗑️ REMOVED: setFilters and resetFilters are no longer needed
  },
  extraReducers: (builder) => {
    // Using .addCase for clarity
    builder
      // Fetch
      .addCase(fetchBhajans.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBhajans.fulfilled, (state, action) => {
        state.status = "succeeded";
        // 🔄 MODIFIED: Handle paginated response
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchBhajans.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })

      // Add
      .addCase(addBhajan.fulfilled, (state, action) => {
        // Optimistic update; for paginated data, a refetch is often preferred.
        state.list.unshift(action.payload);
      })

      // Update
      .addCase(updateBhajan.fulfilled, (state, action) => {
        const index = state.list.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })

      // Delete
      .addCase(deleteBhajan.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b._id !== action.payload);
      });
  },
});

// 🗑️ REMOVED: No longer exporting setFilters, resetFilters
export default bhajanSlice.reducer;
