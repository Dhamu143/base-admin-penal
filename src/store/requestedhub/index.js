import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appAllGetRequestedHubs = createAsyncThunk(
  "appRequestedHubs/appAllGetRequestedHubs",
  async (params) => {
    // console.log(params)
    try {
      let url = `/requestedhub?&hubswitchrequested=${params.hubswitchrequested}`; 
      // if (params.hubswitchrequested) {
      //   url += `?&hubswitchrequested=${params.hubswitchrequested}`;
      // }
      const response = await httpService.get(url);
      // console.log(response)
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateRequsted = createAsyncThunk(
  "appRequestedHubs/appUpdateRequsted",
  async (params) => {
    console.log(params, "params")
    try {
      const response = await httpService.put(
        `/requestedhub/${params.id}`,
        {},
        {
          status: params.status,
          rejectionreason: params.rejectionreason,
        }
      );
      console.log(response,"response")
      // toast.success("Sponsor is Updated Successfully");
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteRequestedHub = createAsyncThunk(
  "appRequestedHubs/appDeleteRequestedHub",
  async (id) => {
    try {
        const response = await httpService.delete(`/requestedhub/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Requested Hub Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appRequestedHubSlice = createSlice({
  name: "RequestedHubs",
  initialState: {
    requestedhub: [],
    isloder: false,
    paginate: "",
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appAllGetRequestedHubs.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(
      isAllOf(appAllGetRequestedHubs.fulfilled),
      (state, action) => {
        state.requestedhub = action.payload;
        const paginate = {
          hasNextPage: action?.payload?.pagination?.totalPages > action?.payload?.pagination?.currentPage,
          hasPrevPage: action?.payload?.pagination?.currentPage > 1,
          limit: action?.payload?.pagination?.pageSize,
          nextPage: action?.payload?.pagination?.currentPage + 1,
          page: action?.payload?.pagination?.currentPage,
          pagingCounter: (action?.payload?.pagination?.currentPage - 1) * action?.payload?.pagination?.pageSize + 1,
          prevPage: action?.payload?.pagination?.currentPage - 1,
          totalDocs: action?.payload?.pagination?.totalRecords,
          totalPages: action?.payload?.pagination?.totalPages,
        };
        state.paginate = paginate;
        state.isloder = false;
      }
    );
    builder.addMatcher(
      isAllOf(appAllGetRequestedHubs.rejected),
      (state, action) => {
        state.isloder = false;
      }
    );
  
    builder.addMatcher(isAllOf(appDeleteRequestedHub.pending), (state, action) => {
      state.isloder = true;
      state.isdeleted = false;
    });
    builder.addMatcher(
      isAllOf(appDeleteRequestedHub.fulfilled),
      (state, action) => {
        state.isdeleted = true;
        state.requestedhub?.splice(
          state.requestedhub?.findIndex((data) => data?._id === action.payload.id),
          1
        );
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appDeleteRequestedHub.rejected), (state) => {
      state.isdeleted = false;
      state.isloder = false;
    });
  },
});
  
export default appRequestedHubSlice.reducer;
