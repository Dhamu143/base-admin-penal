import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- THUNKS ---

// ✨ REFINED: Thunk now cleans params to avoid sending empty queries like 'language='
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
      const response = await httpService.post("/god/create", godData);
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
      const response = await httpService.put(`/god/${id}`, godData);
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
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Could not delete god.");
    }
  }
);

// --- SLICE DEFINITION ---
const godSlice = createSlice({
  name: "god",
  initialState: {
    list: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    status: "idle",
    masterList: [],
    masterStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Cases for PAGINATED list ---
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
      // --- Cases for MASTER list ---
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

      // ✨ FIX: Handle ADD action to keep masterList and list in sync
      .addCase(addGod.fulfilled, (state, action) => {
        const newGod = action.payload;
        // Add to master list for the dropdown
        state.masterList.unshift(newGod);
        // We don't need to add to the `list` here because the component
        // will refetch the current page after adding.
      })

      // ✨ FIX: Handle UPDATE action to keep masterList and list in sync
      .addCase(updateGod.fulfilled, (state, action) => {
        const updatedGod = action.payload;
        // Update the item in the master list
        state.masterList = state.masterList.map((god) =>
          god._id === updatedGod._id ? updatedGod : god
        );
        // Also update the item if it exists in the current paginated list
        state.list = state.list.map((god) =>
          god._id === updatedGod._id ? updatedGod : god
        );
      })

      .addCase(deleteGod.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.list = state.list.filter((g) => g._id !== deletedId);
        state.masterList = state.masterList.filter((g) => g._id !== deletedId);
        state.totalItems -= 1; // Decrement total count
      });
  },
});

export default godSlice.reducer;
