import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- THUNKS ---

export const fetchGods = createAsyncThunk(
  "god/fetchPaginated",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Create a new object to avoid mutating the original params
      const cleanedParams = {};
      // Iterate over params and only add keys that have a meaningful value
      for (const key in params) {
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ""
        ) {
          cleanedParams[key] = params[key];
        }
      }

      const queryParams = new URLSearchParams(cleanedParams).toString();
      // Only add '?' if there are actual query parameters
      const url = queryParams ? `/god?${queryParams}` : "/god";

      const response = await httpService.get(url);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not fetch paginated gods.");
    }
  }
);
export const fetchAllGods = createAsyncThunk(
  "god/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpService.get(`/god?limit=1000`);
      return response.data.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not fetch all gods.");
    }
  }
);

export const addGod = createAsyncThunk(
  "god/add",
  async (godData, { rejectWithValue }) => {
    try {
      // Pass an empty object for `params` to force godData into `payload`
      const response = await httpService.post("/god/create", {}, godData); // 👈 The change
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not add god.");
    }
  }
);

export const updateGod = createAsyncThunk(
  "god/update",
  async ({ id, ...godData }, { rejectWithValue }) => {
    try {
      // Same change for the 'put' method
      const response = await httpService.put(`/god/${id}`, {}, godData); // 👈 The change
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not update god.");
    }
  }
);

export const deleteGod = createAsyncThunk(
  "god/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/god/${id}`);
      return id; // Return the ID for removal from state
    } catch (err) {
      return rejectWithValue(err.message || "Could not delete god.");
    }
  }
);

// --- SLICE DEFINITION ---

// A list of our mutation thunks
const mutationThunks = [addGod, updateGod, deleteGod];

const godSlice = createSlice({
  name: "god",
  initialState: {
    list: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    status: "idle", // For fetching the paginated list
    masterList: [],
    masterStatus: "idle", // For fetching the master list
    mutatingStatus: "idle", // ✨ NEW: For CUD (Create, Update, Delete) operations
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Cases for PAGINATED list (fetchGods) ---
      .addCase(fetchGods.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
        state.currentPage = action.payload.pagination.currentPage;
        state.totalPages = action.payload.pagination.totalPages;
        state.totalItems = action.payload.pagination.totalRecords;
      })
      .addCase(fetchGods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Cases for MASTER list (fetchAllGods) ---
      .addCase(fetchAllGods.pending, (state) => {
        state.masterStatus = "loading";
      })
      .addCase(fetchAllGods.fulfilled, (state, action) => {
        state.masterStatus = "succeeded";
        state.masterList = action.payload;
      })
      .addCase(fetchAllGods.rejected, (state, action) => {
        state.masterStatus = "failed";
        state.error = action.payload;
      })

      // --- Cases for MUTATION results (add, update, delete) ---
      .addCase(addGod.fulfilled, (state, action) => {
        state.masterList.unshift(action.payload);
      })
      .addCase(updateGod.fulfilled, (state, action) => {
        const updatedGod = action.payload;
        // Update both lists to maintain UI consistency
        state.masterList = state.masterList.map((god) =>
          god._id === updatedGod._id ? updatedGod : god
        );
        state.list = state.list.map((god) =>
          god._id === updatedGod._id ? updatedGod : god
        );
      })
      .addCase(deleteGod.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.list = state.list.filter((g) => g._id !== deletedId);
        state.masterList = state.masterList.filter((g) => g._id !== deletedId);
        state.totalItems -= 1;
      })

      // ✨ UPDATE: Use `addMatcher` for shared logic across mutation thunks
      .addMatcher(
        (action) => mutationThunks.some((thunk) => thunk.pending.match(action)),
        (state) => {
          state.mutatingStatus = "loading";
          state.error = null; // Clear previous errors on a new attempt
        }
      )
      .addMatcher(
        (action) =>
          mutationThunks.some((thunk) => thunk.fulfilled.match(action)),
        (state) => {
          state.mutatingStatus = "succeeded";
        }
      )
      .addMatcher(
        (action) =>
          mutationThunks.some((thunk) => thunk.rejected.match(action)),
        (state, action) => {
          state.mutatingStatus = "failed";
          state.error = action.payload;
        }
      );
  },
});

export default godSlice.reducer;
