import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

// export const appCreateComplianceDate = createAsyncThunk(
//   "appComplianceDate/appCreateComplianceDate",
//   async (params) => {
//     console.log(params,"params")
//     try {
//       const response = await httpService.post("/compliancedate", {}, params);
//       if (response?.data) {
//         toast.success("Compliances Date created Successfully");
//         params.navigate(`/compliance`);
//       }
//       return await response.data;
//     } catch (error) {
//       toast.error(error?.message);
//     }
//   }
// );

export const appAllGetFacilityBooking = createAsyncThunk(
  "appFacilityBooking/appAllGetFacilityBooking",
  async (params) => {
    try {
      let url = `/facilitybooking?page=${params.page}&limit=${params.limit}`;
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
      const response = await httpService.get(url);
   //  const response = await httpService.get(`/facilitybooking?page=${params.page}&limit=${params.limit}`);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateFacilityBooking = createAsyncThunk(
  "appFacilityBooking/appUpdateFacilityBooking",
  async (params) => {
    console.log(params, "params")
    try {
      const response = await httpService.put(
        `/facilitybooking/${params.id}`,
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

export const appDeleteFacilityBooking = createAsyncThunk(
  "appFacilityBooking/appDeleteFacilityBooking",
  async (id) => {
    try {
        const response = await httpService.delete(`/facilitybooking/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Facility Booking Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

// export const appUpdateComplianceDate = createAsyncThunk(
//   "appComplianceDate/appUpdateComplianceDate",
//   async (params) => {
//     console.log(params)
//     try {
//       const response = await httpService.put(
//         `/compliancedate/${params.id}`,
//         {},
//         {
//           name: params.name,
//           documentdate: params.documentdate,
//           documentDuedate: params.documentDuedate,
//         }
//       );
//       console.log(response,"response")
//       params.navigate("/compliance");
//       toast.success("Compliances Date is Updated Successfully");
      
//       return await response.data;
//     } catch (error) {
//       toast.error(error?.message);
//     }
//   }
// );

// export const appDeleteComplianceDate = createAsyncThunk(
//   "appComplianceDate/appDeleteComplianceDate",
//   async (id) => {
//     try {
//         const response = await httpService.delete(`/compliancedate/${id}`);
//       if (response?.data) {
//         response.data.id = id;
//         toast.success("Compliances Date Deleted Successfully");
//       }
//       return await response.data;
//     } catch (error) {
//       toast.error(error?.message);
//     }
//   }
// );


export const appFacilityBookingSlice = createSlice({
  name: "FacilityBooking",
  initialState: {
    // compliancesDate: [],
    facilitylist: [],
    isloder: false,
    paginate: "",
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appAllGetFacilityBooking.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(
      isAllOf(appAllGetFacilityBooking.fulfilled),
      (state, action) => {
        state.facilitylist = action.payload;
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
      isAllOf(appAllGetFacilityBooking.rejected),
      (state, action) => {
        state.isloder = false;
      }
    );
    // builder.addMatcher(isAllOf(appDeleteComplianceDate.pending), (state, action) => {
    //   state.isloder = true;
    //   state.isdeleted = false;
    // });
    // builder.addMatcher(
    //   isAllOf(appDeleteComplianceDate.fulfilled),
    //   (state, action) => {
    //     state.isdeleted = true;
    //     state.compliancesDate?.splice(
    //       state.compliancesDate?.findIndex((data) => data?._id === action.payload.id),
    //       1
    //     );
    //     state.isloder = false;
    //   }
    // );
    // builder.addMatcher(isAllOf(appDeleteComplianceDate.rejected), (state) => {
    //   state.isdeleted = false;
    //   state.isloder = false;
    // });
  },
});
  
export default appFacilityBookingSlice.reducer;