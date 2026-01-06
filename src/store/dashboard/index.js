import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appGetAllDashboard = createAsyncThunk(
  "appDashboard/appGetAllDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpService.get("/dashboard-stats");

      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const appDashboardSlice = createSlice({
  name: "Dashboard",
  initialState: {
    dashboard: null,
    isloder: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(appGetAllDashboard.pending, (state) => {
        state.isloder = true;
        state.error = null;
      })
      .addCase(appGetAllDashboard.fulfilled, (state, action) => {
        state.isloder = false;
        state.dashboard = action.payload;
      })
      .addCase(appGetAllDashboard.rejected, (state, action) => {
        state.isloder = false;
        state.error = action.payload;
      });
  },
});

export default appDashboardSlice.reducer;
