import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// 1. Fetch All Logs (with pagination support)
export const fetchDailyLogs = createAsyncThunk(
  "dailyLog/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string (e.g., ?page=1&limit=10)
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v != null && v !== "")
        )
      ).toString();

      const url = queryString
        ? `/dailylog/all?${queryString}`
        : "/dailylog/all";
      const response = await httpService.get(url);

      // Expecting { success: true, data: { data: [...], pagination: {...} } }
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch daily logs"
      );
    }
  }
);

// 2. Fetch Single Log by ID (For Edit Page)
export const fetchDailyLogById = createAsyncThunk(
  "dailyLog/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      // Note: Ensure you have a backend route like: router.get("/:id", ...)
      // If not, you might need to rely on the list data or add the route.
      const response = await httpService.get(`/dailylog/${id}`);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch daily log details"
      );
    }
  }
);

// 3. Add New Log
export const addDailyLog = createAsyncThunk(
  "dailyLog/add",
  async (logData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/dailylog/add", {}, logData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add daily log"
      );
    }
  }
);

// 4. Update Log
export const updateDailyLog = createAsyncThunk(
  "dailyLog/update",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/dailylog/edit/${id}`, {}, data);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update daily log"
      );
    }
  }
);

// 5. Delete Log
export const deleteDailyLog = createAsyncThunk(
  "dailyLog/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/dailylog/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete daily log"
      );
    }
  }
);

const initialState = {
  list: [],
  currentLog: null, // Stores single log for editing
  pagination: null,
  status: "idle", // For list fetching
  detailsStatus: "idle", // For single item fetching
  error: null,
};

const dailyLogSlice = createSlice({
  name: "dailyLog",
  initialState,
  reducers: {
    // Synchronous action to clear the current selected log (used when leaving Edit page)
    clearCurrentDailyLog: (state) => {
      state.currentLog = null;
      state.detailsStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch List ---
      .addCase(fetchDailyLogs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDailyLogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Handle structure: response.data.data.data (List) & response.data.data.pagination
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchDailyLogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })

      // --- Fetch Single by ID ---
      .addCase(fetchDailyLogById.pending, (state) => {
        state.detailsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDailyLogById.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.currentLog = action.payload;
      })
      .addCase(fetchDailyLogById.rejected, (state, action) => {
        state.detailsStatus = "failed";
        state.error = action.payload;
      })

      // --- Add ---
      .addCase(addDailyLog.fulfilled, (state) => {
        // You can choose to push to list here, or rely on re-fetching the list in the UI
        state.status = "succeeded";
      })

      // --- Update ---
      .addCase(updateDailyLog.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (log) => log._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.currentLog = action.payload; // Update current view if open
      })

      // --- Delete ---
      .addCase(deleteDailyLog.fulfilled, (state, action) => {
        state.list = state.list.filter((log) => log._id !== action.payload);
      });
  },
});

export const { clearCurrentDailyLog } = dailyLogSlice.actions;

export default dailyLogSlice.reducer;
