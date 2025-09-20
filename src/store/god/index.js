import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- THUNKS (Unchanged) ---
export const fetchGods = createAsyncThunk(
  "god/fetchPaginated",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await httpService.get(
        `/god?page=${page}&limit=${limit}`
      );
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
      const response = await httpService.get(`/god?limit=1000 `);
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
      const response = await httpService.post("/god/create", {}, godData);
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
      const response = await httpService.put(`/god/${id}`, {}, godData);
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
    pagination: null,
    status: "idle", // General status for read operations
    masterList: [],
    masterStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Helper function to handle pending/rejected for multiple actions
    const addCrudCases = (thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = "loading"; // Use general status for saving/deleting
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        });
    };

    builder
      // --- Cases for PAGINATED list ---
      .addCase(fetchGods.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchGods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Cases for COMPLETE list ---
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

      // --- Cases for ADD ---
      .addCase(addGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Add to both lists for immediate UI feedback
        state.list.unshift(action.payload); // Add to start of current page
        state.masterList.push(action.payload);
      })

      // --- Cases for UPDATE ---
      .addCase(updateGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedGod = action.payload;
        // Update in paginated list
        const listIndex = state.list.findIndex((g) => g._id === updatedGod._id);
        if (listIndex !== -1) {
          state.list[listIndex] = updatedGod;
        }
        // Update in master list
        const masterListIndex = state.masterList.findIndex(
          (g) => g._id === updatedGod._id
        );
        if (masterListIndex !== -1) {
          state.masterList[masterListIndex] = updatedGod;
        }
      })

      // --- Cases for DELETE ---
      .addCase(deleteGod.fulfilled, (state, action) => {
        state.status = "succeeded";
        const deletedId = action.payload;
        // Remove from both lists
        state.list = state.list.filter((g) => g._id !== deletedId);
        state.masterList = state.masterList.filter((g) => g._id !== deletedId);
      });

    // Add pending/rejected cases for all CRUD actions
    [addGod, updateGod, deleteGod].forEach(addCrudCases);
  },
});

export default godSlice.reducer;
