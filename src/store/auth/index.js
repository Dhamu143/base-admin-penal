// import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// // ** Axios Imports
// import { toast } from "react-toastify";
// import httpService from "../../common/http.service";
// import { act } from "react";

// export const appLoginUser = createAsyncThunk(
//   "appUser/appLoginUser",
//   async (params) => {
//     console.log(params, "params")
//     try {
//       const response = await httpService.post(
//         "/admin/signin",
//         {},
//         params
//         // {
//         //   email: params.email,
//         //   password: params.password,
//         // }
//       );
//       console.log(response, "response")
//       if (response.data) {
//         response.data.navigate = params.navigate;
//       }
//       return await response.data;
//     } catch (error) {
//       toast.error(error?.message);
//     }
//   }
// );


// export const appUserSlice = createSlice({
//   name: "User",
//   initialState: {
//     user: "",
//     userType: "",
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addMatcher(isAllOf(appLoginUser.fulfilled), (state, action) => {
//       state.user = action.payload?.data;
//       const userPermissions = action.payload?.data?.user?.permissions || [];
//       const permissionNames = userPermissions.map(permission => permission.name);
//       state.userType = permissionNames;
//       console.log(state.userType)
//       console.log(action)
//       if (action?.payload?.data?.token) {
//         localStorage.setItem("token", action?.payload?.data?.token);
//         localStorage.setItem("user", JSON.stringify(action?.payload?.data));
//         localStorage.setItem("permissions", permissionNames.join(','));
        
//         if(action?.payload?.data?.user?.admin === true) {
//           action.payload.navigate("/dashboard");
//         } else {
//           action.payload.navigate(`/${permissionNames[0]}`);
//         }
//       }
//     });
//   },
// });

// export default appUserSlice.reducer;

import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appHubLogin = createAsyncThunk(
  "appHub/appHubLogin",
  async (params) => {
    console.log(params, "params");
    try {
      const response = await httpService.post("/auth/sendotptoadmin", {}, params);
        // console.log(response, "response")
        if (!response.data?.success) {
          toast.error(response.data?.message || "Login failed");
          // return rejectWithValue(response.data);
        }
      if (response.data) {
        response.data.navigate = params.navigate;
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appHubLoginOtp = createAsyncThunk(
  "appHub/appHubLoginOtp",
  async (params) => {
    try {
      const response = await httpService.post("/auth/verifyotptoadmin", {}, params);
      const user = response.data?.user || {};
      const userPermissions = user?.permissions || [];
      const permissionNames = userPermissions.map(p => p.name);

      const isAdmin = user?.isAdmin === true;
      const hasPermissions = permissionNames.length > 0;
      const hasAnyAccess = user?.adminOfHubs || user?.adminOfSanstha || user?.hub;
      console.log(hasPermissions)
      console.log(hasAnyAccess)

      if (!isAdmin && !hasPermissions && !hasAnyAccess) {
        toast.error("You do not have access to this portal.");
        params.navigate("/");
        return;
      }

      // Save to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("permissions", permissionNames.join(","));


      if (!isAdmin && !hasPermissions && hasAnyAccess) {
        toast.success(`You do not have access to this portal.`);
      }

      if (isAdmin) {
        params.navigate("/dashboard");
      } else if (hasPermissions) {
        params.navigate(`/${permissionNames[0]}`);
      }

      return { data: response.data, navigate: params.navigate };
    } catch (error) {
      toast.error(error?.message || "Login failed");
    }
  }
);

export const appHubAdminSlice = createSlice({
  name: "Hub",
  initialState: {
    HubAdmin: "",
    Hub: "",
    // userType: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(isAllOf(appHubLogin.fulfilled), (state, action) => {
      state.Hub = action.payload.data;
      console.log(action.payload.data);
    });
    builder.addMatcher(isAllOf(appHubLoginOtp.fulfilled), (state, action) => {
      state.HubAdmin = action.payload?.data;
      console.log(action.payload);
      // console.log(state);
      const userPermissions =
        action.payload?.data?.user?.permissions || [];
      const permissionNames = userPermissions.map(
        (permission) => permission.name
      );
      console.log(permissionNames);
      state.userType = permissionNames;
      console.log(permissionNames);
      console.log(state.HubAdmin);
      if (action?.payload?.data?.token) {
        const token = action.payload.data.token;
        console.log(token, "token");
        const user = action.payload.data.user || "";
        console.log(user, "user");
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("permissions", permissionNames.join(","));

        // if (action?.payload?.data?.user?.isAdmin === true) {
        //   action.payload.navigate("/dashboard");
        //   console.log(action.payload);
        // } else if (permissionNames.length > 0) {
        //   console.log(action.payload);
        //   action.payload.navigate(`/${permissionNames[0]}`);
        // } else {
        //   toast.error("You do not have access to this portal.");
        //   action.payload.navigate("/");
        // }
      }
    });
  },
});

export default appHubAdminSlice.reducer;

