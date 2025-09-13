import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";


export const appCreatePaymentSettings = createAsyncThunk(
  "appPaymentSettings/appCreatePaymentSettings",
  async (params) => {
    // console.log(params)
    try {
      const response = await httpService.post("/payment/settings", {}, params);
      // console.log(response)
      if (response?.data) {
        toast.success("Payment Setting created Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appAllGetPaymentSettings = createAsyncThunk(
  "appPaymentSettings/appAllGetPaymentSettings",
  async (params) => {
    // console.log(params)
    try {
      // let url = `/requestedhub`;
      // if (params.hubswitchrequested) {
      //   url += `?&hubswitchrequested=${params.hubswitchrequested}`;
      // }
      const response = await httpService.get(`/payment/settings`);
      // console.log(response)
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appPaymentSettingsSlice = createSlice({
  name: "Payment Settings",
  initialState: {
    payment: [],
    isloder: false,
    paginate: "",
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appAllGetPaymentSettings.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(
      isAllOf(appAllGetPaymentSettings.fulfilled),
      (state, action) => {
        state.payment = action.payload;
        state.isloder = false;
      }
    );
    builder.addMatcher(
      isAllOf(appAllGetPaymentSettings.rejected),
      (state, action) => {
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appCreatePaymentSettings.fulfilled), (state, action) => {
      state.payment.push(action.payload?.data);
    });
  
  },
});
  
export default appPaymentSettingsSlice.reducer;
