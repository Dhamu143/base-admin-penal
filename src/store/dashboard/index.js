import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";


export const appGetAllDashboard = createAsyncThunk(
  "appDashboard/appGetAllDashboard",
  async () => {
    try {
      const response = await httpService.get(`/admin/getcounts`);
      // console.log(response);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appDashboardSlice = createSlice({
  name: "Dashboard",
  initialState: {
    dashboard: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(isAllOf(appGetAllDashboard.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllDashboard.fulfilled), (state, action) => {
      state.dashboard = action.payload;
      // console.log(state.dashboard)
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetAllDashboard.rejected), (state, action) => {
      state.isloder = false;
    });
  },
});

export default appDashboardSlice.reducer;
