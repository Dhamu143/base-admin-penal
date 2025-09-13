import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateUser = createAsyncThunk(
  "appUser/appCreateUser",
  async (params) => {
    console.log(params,"params")
    try {
      const response = await httpService.post("/users", {}, params);
      if (response?.data) {
        toast.success("User created Successfully");
        params.navigate(`/User`);
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appGetAllUser = createAsyncThunk(
  "appUser/appGetAllUser",
  async (params) => {
    try {
      let url = `/users?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hubId=${params.hub}`;
      }
        if (params.firstName) {
        url += `&firstName=${params.firstName}`;
      }
      if (params.lastName) {
        url += `&lastName=${params.lastName}`;
      }
      if (params.email) {
        url += `&email=${params.email}`;
      }
      if (params.mobile) {
        url += `&mobile=${params.mobile}`;
      }
      if (params.goutra) {
        url += `&goutra=${params.goutra}`;
      }
      if (params.sansthaId) {
        url += `&sansthaId=${params.sansthaId}`;
      }
      if(params.joinuser) {
        url += `&joinuser=${params.joinuser}`;
      }
      const response = await httpService.get(url);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateUser = createAsyncThunk(
  "appUser/appUpdateUser",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/users/${params.id}`,
        {},
        // params
        {
          name: params.name,
          language: params.language,
          nativeplace: params.nativeplace,
          religion: params.religion,
          significance: params.significance,
        }
      );
      console.log(response,"response")
      if (response.data) {
        if (params.editImage) {
          params.navigate(`/users/${params?.editImage}/images/list`);
          toast.success("Image is Updated Successfully");
        } else if (params.newImage) {
          params.navigate(`/users/${params?.newImage}/images/list`);
          toast.success("Image is Created Successfully");
        } else if (params.deleteImage) {
          params.navigate(`/users/${params?.deleteImage}/images/list`);
          toast.success("Image is removed successfully");
        } else {
          params.navigate("/users/1");
          toast.success("User is Updated Successfully");
        }
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateUserByAdmin = createAsyncThunk(
  "appUser/appUpdateUserByAdmin",
  async (payload) => {
    console.log(payload)
    try {
      const response = await httpService.post(
        `/users/updateuser?id=${payload.id}`,
        {}, 
        {
          isUserBlocked: payload.isUserBlocked,
        }
      );

      if (response.data) {
        if (typeof payload.isUserBlocked === "boolean") {
          toast.success(
            `User has been ${payload.isUserBlocked ? "blocked" : "unblocked"} successfully`
          );
          payload.navigate(`/user/1`);
        } else {
          toast.success("User is Updated Successfully");
        }

        if (payload.navigate) {
          payload.navigate(`/user/1`);
        }
      }

      return response.data;
    } catch (error) {
      toast.error(error?.message || "Failed to update user");
      throw error;
    }
  }
);

export const appGetUserById = createAsyncThunk(
  "appUser/appGetUserById",
  async (id) => {
    try {
      const response = await httpService.get(`/users/${id}`);
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appGetNewUser = createAsyncThunk(
  "appUser/appGetNewUser",
  async (params) => {
    try {
      const response = await httpService.get(`/users?newuser=true&page=${params.page}&limit=${params.limit}`);
      console.log(response)
      return await response.data.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUploadUser = createAsyncThunk(
  "appUser/appUploadUser",
  async (params, { rejectWithValue }) => {
   
    const formData = new FormData();
    formData.append("file", params.file);

    try { 
      let url = `/upload/members?hub=${params.hub}`;
      if (params.sansthaId) {
        url += `&sansthaId=${params.sansthaId}`;
      }
      const response = await httpService.post(url,{},formData,  { "Content-Type": "multipart/form-data" });
     console.log(response)
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error?.response?.data?.message || "Upload failed");
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);


export const appDeleteUser = createAsyncThunk(
  "appUser/appDeleteUser",
  async (id) => {
    try {
      const response = await httpService.delete(`/users/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("User Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUserSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    newUser:[],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {
    handleSuggestedLanguage: (state, action) => {
      state.slugData.suggested[action.payload.number].users[
        action.payload.index
      ].ischeck = !state.slugData.suggested[action.payload.number].users[
        action.payload.index
      ].ischeck;
      for (let index = 0; index < state.slugData.suggested.length; index++) {
        const element = state.slugData.suggested[index];
        if (element.required) {
          const filterIndex = element.users.filter((i) => i.ischeck);
          if (filterIndex.length) {
            if (element.maximum < filterIndex.length) {
              element.formIsValid = false;
              return;
            } else {
              element.formIsValid = true;
            }
          } else {
            element.formIsValid = false;
            return;
          }
        } else {
          element.formIsValid = true;
        }
      }
    },
    setUsers: (state, action) => {
      state.users = action.payload;
      console.log(action.payload);
    },
  },
  extraReducers: (builder) => {
    // builder.addMatcher(isAllOf(appUserUser.fulfilled), (state, action) => {
    //   state.users.push(action.payload?.data);
    // });
    builder.addMatcher(isAllOf(appDeleteUser.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteUser.fulfilled), (state, action) => {
      state.isdeleted = true;
      state.users?.splice(
        state.users?.findIndex((data) => data?._id === action.payload.id),
        1
      );
    });
    builder.addMatcher(isAllOf(appDeleteUser.rejected), (state, action) => {
      state.isdeleted = false;
    });    
    builder.addMatcher(isAllOf(appUpdateUser.fulfilled), (state, action) => {
      const index = state.users?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.users[index] = action?.payload?.data;
      toast.success(action, "User is Updated Successfully");
      // state.slugData = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllUser.fulfilled), (state, action) => {
      state.users = action.payload?.data;
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
    });
    builder.addMatcher(isAllOf(appGetNewUser.fulfilled), (state, action) => {
      state.newUser = action.payload;
console.log(state.newUser)
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetUserById.pending), (state) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetUserById.fulfilled), (state, action) => {
      state.isloder = false;
      state.userDetails = action.payload.data.data;
    });
    builder.addMatcher(isAllOf(appGetUserById.rejected), (state) => {
      state.isloder = false;
    });
  },
});

export const { handleSuggestedLanguage, setUsers } = appUserSlice.actions;
export default appUserSlice.reducer;
