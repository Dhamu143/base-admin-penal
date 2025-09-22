import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- Async Thunks ---

// Fetch with pagination/filter support
export const fetchAartis = createAsyncThunk(
  "aartis/fetchAartis",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();

      const url = queryString ? `/aarti?${queryString}` : "/aarti";
      console.log("🔍 Fetching Aartis with:", url);

      const response = await httpService.get(url);
      console.log("✅ Fetched Aartis:", response.data);

      return response.data?.data;
    } catch (err) {
      console.error("❌ Error fetching Aartis:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch aartis"
      );
    }
  }
);

// Fetch single
export const fetchAartiById = createAsyncThunk(
  "aartis/fetchAartiById",
  async (id, { rejectWithValue }) => {
    try {
      console.log("🔍 Fetching Aarti by ID:", id);
      const response = await httpService.get(`/aarti/${id}`);
      console.log("✅ Fetched Aarti:", response.data);
      return response.data?.data || response.data;
    } catch (err) {
      console.error("❌ Error fetching Aarti by ID:", err);
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch aarti"
      );
    }
  }
);

// Update
export const updateAarti = createAsyncThunk(
  "aartis/updateAarti",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      console.log("✏️ Updating Aarti:", id, data);

      // Use {} for params, pass data as the third argument
      const response = await httpService.put(`/aarti/${id}`, {}, data);

      console.log("✅ Updated Aarti:", response.data);
      return response.data?.data;
    } catch (err) {
      console.error("❌ Error updating Aarti:", err);
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update aarti"
      );
    }
  }
);

// Add
export const addAarti = createAsyncThunk(
  "aartis/addAarti",
  async (aartiData, { rejectWithValue }) => {
    try {
      console.log("➕ Adding Aarti:", aartiData);

      const response = await httpService.post("/aarti/create", {}, aartiData);
      console.log("✅ Added Aarti:", response.data);

      return response.data?.data;
    } catch (err) {
      console.error("❌ Error adding Aarti:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to add aarti"
      );
    }
  }
);

// Delete
export const deleteAarti = createAsyncThunk(
  "aartis/deleteAarti",
  async (id, { rejectWithValue }) => {
    try {
      console.log("🗑️ Deleting Aarti:", id);

      const response = await httpService.delete(`/aarti/${id}`);
      console.log("✅ Deleted Aarti:", response.data);

      return id;
    } catch (err) {
      console.error("❌ Error deleting Aarti:", err);
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete aarti"
      );
    }
  }
);

// --- Slice ---
const initialState = {
  list: [],
  pagination: null,
  currentAarti: null,
  status: "idle",
  detailsStatus: "idle",
  error: null,
};

const aartiSlice = createSlice({
  name: "aartis",
  initialState,
  reducers: {
    clearCurrentAarti: (state) => {
      console.log("🧹 Clearing currentAarti");
      state.currentAarti = null;
      state.detailsStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchAartis.pending, (state) => {
        console.log("⏳ Fetching Aartis...");
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAartis.fulfilled, (state, action) => {
        console.log("✅ Aartis fetch success:", action.payload);
        state.status = "succeeded";
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchAartis.rejected, (state, action) => {
        console.error("❌ Aartis fetch failed:", action.payload);
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })

      // Fetch single
      .addCase(fetchAartiById.pending, (state) => {
        console.log("⏳ Fetching single Aarti...");
        state.detailsStatus = "loading";
      })
      .addCase(fetchAartiById.fulfilled, (state, action) => {
        console.log("✅ Single Aarti fetched:", action.payload);
        state.detailsStatus = "succeeded";
        state.currentAarti = action.payload;
      })
      .addCase(fetchAartiById.rejected, (state, action) => {
        console.error("❌ Single Aarti fetch failed:", action.payload);
        state.detailsStatus = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addAarti.fulfilled, (state, action) => {
        console.log("✅ Aarti added to store:", action.payload);
        state.list.push(action.payload);
      })

      // Update
      .addCase(updateAarti.fulfilled, (state, action) => {
        console.log("✅ Aarti updated in store:", action.payload);
        const index = state.list.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteAarti.fulfilled, (state, action) => {
        console.log("✅ Aarti deleted from store:", action.payload);
        state.list = state.list.filter((a) => a._id !== action.payload);
      });
  },
});

export const { clearCurrentAarti } = aartiSlice.actions;
export default aartiSlice.reducer;
