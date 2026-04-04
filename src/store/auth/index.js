import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";
// import { act } from "react";

export const appLoginUser = createAsyncThunk(
  "appUser/appLoginUser",
  async (params) => {
    try {
      const { email, password, navigate } = params;

      const response = await httpService.post(
        "/admin/auth/signin",
        {}, // query params
        { email, password } // body
      );

      if (response.data) {
        response.data.navigate = navigate;
      }
      return response.data;
    } catch (error) {
      toast.error(error?.message);
      throw error;
    }
  }
);

export const appUserSlice = createSlice({
  name: "User",
  initialState: {
    user: "",
    userType: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(isAllOf(appLoginUser.fulfilled), (state, action) => {
      state.user = action.payload?.data;
      const userPermissions = action.payload?.data?.user?.permissions || [];
      const permissionNames = userPermissions.map(
        (permission) => permission.name
      );
      state.userType = permissionNames;
      console.log(state.userType);
      console.log(action);
      if (action?.payload?.data?.token) {
        localStorage.setItem("token", action?.payload?.data?.token);
        localStorage.setItem("user", JSON.stringify(action?.payload?.data));
        localStorage.setItem("permissions", permissionNames.join(","));

        if (action?.payload?.data?.user?.admin === true) {
          action.payload.navigate("/dashboard");
        } else {
          action.payload.navigate(`/${permissionNames[0]}`);
        }
      }
    });
  },
});

export default appUserSlice.reducer;
