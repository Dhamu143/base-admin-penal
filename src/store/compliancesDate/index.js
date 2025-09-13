import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateComplianceDate = createAsyncThunk(
  "appComplianceDate/appCreateComplianceDate",
  async (params) => {
    console.log(params,"params")
    try {
      const response = await httpService.post("/compliancedate", {}, params);
      if (response?.data) {
        toast.success("Compliances Date created Successfully");
        params.navigate(`/compliance`);
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appAllGetComplianceDate = createAsyncThunk(
  "appComplianceDate/appAllGetComplianceDate",
  async () => {
    try {
     const response = await httpService.get(`/compliancedate`);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateComplianceDate = createAsyncThunk(
  "appComplianceDate/appUpdateComplianceDate",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/compliancedate/${params.id}`,
        {},
        {
          name: params.name,
          documentdate: params.documentdate,
          documentDuedate: params.documentDuedate,
        }
      );
      console.log(response,"response")
      params.navigate("/compliance");
      toast.success("Compliances Date is Updated Successfully");
      
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteComplianceDate = createAsyncThunk(
  "appComplianceDate/appDeleteComplianceDate",
  async (id) => {
    try {
        const response = await httpService.delete(`/compliancedate/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Compliances Date Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appComplianceDatesSlice = createSlice({
  name: "CompliancesDate",
  initialState: {
    compliancesDate: [],
    isloder: false,
    paginate: "",
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appAllGetComplianceDate.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(
      isAllOf(appAllGetComplianceDate.fulfilled),
      (state, action) => {
        state.compliancesDate = action.payload;
        state.isloder = false;
      }
    );
    builder.addMatcher(
      isAllOf(appAllGetComplianceDate.rejected),
      (state, action) => {
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appDeleteComplianceDate.pending), (state, action) => {
      state.isloder = true;
      state.isdeleted = false;
    });
    builder.addMatcher(
      isAllOf(appDeleteComplianceDate.fulfilled),
      (state, action) => {
        state.isdeleted = true;
        state.compliancesDate?.splice(
          state.compliancesDate?.findIndex((data) => data?._id === action.payload.id),
          1
        );
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appDeleteComplianceDate.rejected), (state) => {
      state.isdeleted = false;
      state.isloder = false;
    });
  },
});
  
export default appComplianceDatesSlice.reducer;