import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../common/http.service"; // Import your custom HttpService

const BASE_PATH = "/dailylog";

// 1. Fetch All Logs
export const fetchDailyLogs = createAsyncThunk(
  "dailyLog/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log("🔍 [Fetch All] Sending params:", params);
      const response = await http.get(`${BASE_PATH}/all`, params);

      let rawData = response.data?.data || response.data || [];
      let list = rawData.data || rawData;

      if (!Array.isArray(list) && typeof list === "object") {
        list = [list];
      }

      console.log("✅ [Fetch All] Success. Count:", list.length);
      return {
        data: list,
        pagination: rawData.pagination || null,
      };
    } catch (err) {
      console.error("❌ [Fetch All] Error:", err.message);
      return rejectWithValue(err.message || "Failed to fetch logs");
    }
  }
);

// 2. Fetch Single Log by ID
export const fetchDailyLogById = createAsyncThunk(
  "dailyLog/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log("🔍 [Fetch By ID] ID:", id);
      const response = await http.get(`${BASE_PATH}/${id}`);
      const data = response.data?.data || response.data;

      if (!data) throw new Error("Log not found");

      console.log("✅ [Fetch By ID] Data found");
      return data;
    } catch (err) {
      console.error("❌ [Fetch By ID] Error:", err.message);
      return rejectWithValue(err.message || "Failed to fetch details");
    }
  }
);

// 3. Add New Log
export const addDailyLog = createAsyncThunk(
  "dailyLog/add",
  async (logData, { rejectWithValue }) => {
    try {
      console.log("📤 [Add Log] Payload:", logData);
      // Signature: post(url, params, payload) -> we pass null for params
      const response = await http.post(`${BASE_PATH}/add`, null, logData);

      console.log("✅ [Add Log] Success");
      return response.data?.data || response.data;
    } catch (err) {
      console.error("❌ [Add Log] Error:", err.message);
      return rejectWithValue(err.message || "Failed to add log");
    }
  }
);

// 4. Update Log
export const updateDailyLog = createAsyncThunk(
  "dailyLog/update",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      console.log("📤 [Update Log] ID:", id, "Payload:", data);
      // Signature: put(url, params, payload)
      const response = await http.put(`${BASE_PATH}/edit/${id}`, null, data);

      console.log("✅ [Update Log] Success");
      return response.data?.data || response.data;
    } catch (err) {
      console.error("❌ [Update Log] Error:", err.message);
      return rejectWithValue(err.message || "Failed to update log");
    }
  }
);

// 5. Delete Log
export const deleteDailyLog = createAsyncThunk(
  "dailyLog/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log("🗑️ [Delete Log] ID:", id);
      await http.delete(`${BASE_PATH}/delete/${id}`);

      console.log("✅ [Delete Log] Removed from DB");
      return id;
    } catch (err) {
      console.error("❌ [Delete Log] Error:", err.message);
      return rejectWithValue(err.message || "Failed to delete log");
    }
  }
);

const dailyLogSlice = createSlice({
  name: "dailyLog",
  initialState: {
    list: [],
    currentLog: null,
    pagination: null,
    status: "idle",
    detailsStatus: "idle",
    error: null,
  },
  reducers: {
    clearCurrentDailyLog: (state) => {
      state.currentLog = null;
      state.detailsStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyLogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDailyLogById.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.currentLog = action.payload;
      })
      .addCase(addDailyLog.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) state.list.unshift(action.payload);
      })
      .addCase(updateDailyLog.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.currentLog = action.payload;
        const index = state.list.findIndex(
          (log) => log._id === action.payload._id
        );
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteDailyLog.fulfilled, (state, action) => {
        state.list = state.list.filter((log) => log._id !== action.payload);
      });
  },
});

export const { clearCurrentDailyLog } = dailyLogSlice.actions;
export default dailyLogSlice.reducer;
