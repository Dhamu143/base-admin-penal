import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";


export const appAllGetBoliBooking = createAsyncThunk(
  "appBoliBooking/appAllGetBoliBooking",
  async (params) => {
    try {
      let url = `/bolibooking?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hub=${params.hub}`;
      }
      if (params.sanstha) {
        url += `&sansthaId=${params.sanstha}`;
      }
      if (params.startDate) {
        url += `&startDate=${params.startDate}`;
      }   
      if (params.endDate) {
        url += `&endDate=${params.endDate}`;
      }
      if (params.projectId) {
        url += `&project=${params.projectId}`;
      }
      const response = await httpService.get(url);
   //  const response = await httpService.get(`/facilitybooking?page=${params.page}&limit=${params.limit}`);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateBoliBooking = createAsyncThunk(
  "appBoliBooking/appUpdateBoliBooking",
  async (params) => {
    console.log(params, "params")
    try {
      const response = await httpService.put(
        `/bolibooking/${params.id}`,
        {},
        {
          status: params.status,
          rejectionreason: params.rejectionreason,
        }
      );
      console.log(response,"response")
       toast.success("Boli booking is Updated Successfully");
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteBoliBooking = createAsyncThunk(
  "appBoliBooking/appDeleteBoliBooking",
  async (id) => {
    try {
        const response = await httpService.delete(`/bolibooking/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Boli Booking Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appSocialProjectBookingSlice = createSlice({
  name: "Boli Booking",
  initialState: {
    // compliancesDate: [],
    bolibookinglist: [],
    isloder: false,
    paginate: "",
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appAllGetBoliBooking.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(
      isAllOf(appAllGetBoliBooking.fulfilled),
      (state, action) => {
        state.bolibookinglist = action.payload;
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
      isAllOf(appAllGetBoliBooking.rejected),
      (state, action) => {
        state.isloder = false;
      }
    );
  },
});
  
export default appSocialProjectBookingSlice.reducer;