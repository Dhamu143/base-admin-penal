import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appGetAllDirectories = createAsyncThunk(
  "appDirectories/appGetAllDirectories",
  async (params) => {
    try {
      let url = `/users?page=${params.page}&limit=${params.limit}`;
      if (params.hubId) {
        url += `&hubId=${params.hubId}`;
      }
      if (params.sansthaId) {
        url += `&sansthaId=${params.sansthaId}`;
      }
        if (params.jobDataEnabled) {
        url += `&jobDataEnabled=${params.jobDataEnabled}`;
      }
         if (params.matrimonialEnabled) {
        url += `&matrimonialEnabled=${params.matrimonialEnabled}`;
      }
        if (params.businessDataEnabled) {
        url += `&businessDataEnabled=${params.businessDataEnabled}`;
      }
       const response = await httpService.get(url);  
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDirectoriesSlice = createSlice({
  name: "Directories",
  initialState: {
    directories: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(isAllOf(appGetAllDirectories.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllDirectories.fulfilled), (state, action) => {
      state.directories = action.payload;
  
      const paginate = {
        hasNextPage: action?.payload?.pagination?.totalPages > action?.payload?.pagination?.currentPage,
        hasPrevPage: action?.payload?.pagination?.currentPage > 1,
        limit: action?.payload?.pagination?.pageSize || 10,
        nextPage: action?.payload?.pagination?.currentPage ? action?.payload?.pagination?.currentPage + 1 : 1,
        page: action?.payload?.pagination?.currentPage || 1,
        pageSize: action?.payload?.pagination?.pageSize || 10,
        pagingCounter: action?.payload?.pagination?.currentPage ? (action?.payload?.pagination?.currentPage - 1) * action?.payload?.pagination?.pageSize + 1 : 1,
        prevPage: action?.payload?.pagination?.currentPage ? action?.payload?.pagination?.currentPage - 1 : 0,
        totalDocs: action?.payload?.pagination?.totalRecords || action?.payload?.data?.length || 0,
        totalPages: action?.payload?.pagination?.totalPages || Math.ceil((action?.payload?.data?.length || 0) / 10)
      };
      state.paginate = paginate;
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetAllDirectories.rejected), (state, action) => {
      state.isloder = false;
    });
  },
});

export default appDirectoriesSlice.reducer;