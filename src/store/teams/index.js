import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateTeams = createAsyncThunk(
  "appTeams/appCreateTeams",
  async (params) => {
    console.log(params,"params")
    try {
      const response = await httpService.post("/team", {}, params);
      if (response?.data) {
        toast.success("Team created Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


// export const appAllGetTeams = createAsyncThunk(
//   "appTeams/appAllGetTeams",
//   async (params) => {
//     console.log(params);
//     try {
//       let url = `/team?userType=platform`;

//       if (params.userId) {
//         url += `&userId=${params.userId}`;
//       }
//       if (params.hub) {
//         url += `&hub=${params.hub}`;
//       }
//       if (params.sanstha) {
//         url += `&sanstha=${params.sanstha}`;
//       }

//       const response = await httpService.get(url, {}, params);
//       return response.data.data;
//     } catch (error) {
//       toast.error(error?.message || "Something went wrong");
//       throw error;
//     }
//   }
// );

export const appAllGetTeams = createAsyncThunk(
  "appTeams/appAllGetTeams",
  async (params) => {
    console.log(params);
    try {
      let url = `/team`;

      if (params.userType) {
        url += `?userType=${params.userType}`;
      } else {
        url += `?userType=platform`; 
      }

      if (params.userId) {
        url += `&userId=${params.userId}`;
      }
      if (params.hub) {
        url += `&hub=${params.hub}`;
      }
      if (params.sanstha) {
        url += `&sanstha=${params.sanstha}`;
      }

      const response = await httpService.get(url, {}, params);
      return response.data.data;
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
      throw error;
    }
  }
);


export const appUpdateTeamspermission = createAsyncThunk(
  "appTeams/appUpdateTeamspermission",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/team/${params.teamId}`,
        {},
        params
      );
      console.log(response,"response")
      toast.success("Teams is Updated Successfully");
      return {
        ...response.data,
        showSuccessPopup: true
      };
    } catch (error) {
      toast.error(error?.message);
      return {
        showSuccessPopup: false
      };
    }
  }
);

export const appUpdateTeams = createAsyncThunk(
  "appTeams/appUpdateTeams",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/team/${params.id}`,
        {},
        {
          email: params.email,
          permissions: params.permissions,
          designation: params.designation,
          sort: params.sort,
          from: params.from,
          to: params.to,
          inactive: params.inactive,
          mobile: params.mobile
        }
      );
      console.log(response,"response")
      toast.success("Teams is Updated Successfully");
      
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteTeams = createAsyncThunk(
  "appTeams/appDeleteTeams",
  async (id) => {
    try {
        const response = await httpService.delete(`/team/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Teams Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appAllGetPermission = createAsyncThunk(
  "appTeams/appAllGetPermission",
  async (userType) => {
    console.log("userType", userType)
    try {
      const response = await httpService.get(`/permission?userType=${userType}`);  
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appTeamsSlice = createSlice({
  name: "Teams",
  initialState: {
    teams: [],
    permission: [],
    isloder: false,
    paginate: "",
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appAllGetTeams.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(
      isAllOf(appAllGetTeams.fulfilled),
      (state, action) => {
        state.teams = action.payload;
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
      isAllOf(appAllGetTeams.rejected),
      (state, action) => {
        state.isloder = false;
      }
    );
    builder.addMatcher(
      isAllOf(appAllGetPermission.fulfilled),
      (state, action) => {
        state.permission = action.payload;
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appDeleteTeams.pending), (state, action) => {
      state.isloder = true;
      state.isdeleted = false;
    });
    builder.addMatcher(
      isAllOf(appDeleteTeams.fulfilled),
      (state, action) => {
        state.isdeleted = true;
        state.teams?.splice(
          state.teams?.findIndex((data) => data?._id === action.payload.id),
          1
        );
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appDeleteTeams.rejected), (state) => {
      state.isdeleted = false;
      state.isloder = false;
    });
  },
});
  
export default appTeamsSlice.reducer;
