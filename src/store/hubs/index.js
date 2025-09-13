import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateHub = createAsyncThunk(
  "appHubs/appCreateHub",
  async (params) => { 
    try {
      const response = await httpService.post("/hub", {}, params);
      if (response?.data) {
        toast.success("Community created Successfully");
        params.navigate("/community-setup");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appAllGetHubs = createAsyncThunk(
  "appHubs/appAllGetHubs",
  async (params) => {
    try {
      let url = `/hub?page=${params.page}&limit=${params.limit}`;
      // Add filter parameters if they exist
      if (params.religion) {
        url += `&religion=${params.religion}`;
      }
      if (params.nativeplace) {
        url += `&nativeplace=${params.nativeplace}`;
      }
      if (params.language) {
        url += `&language=${params.language}`;
      }
      if (params.caste) {
        url += `&caste=${params.caste}`;
      }
      if (params.hubDropdown) {
        url += `&hub=${params.hubDropdown}`;
      }
      const response = await httpService.get(url);
      // params.navigate(`/community-setup/${params.page}`);
      return await response.data;
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error?.message);
    }
  }
);

export const appGetHubById = createAsyncThunk(
  "appHubs/appGetHubById",
  async (id) => {
    try {
      const response = await httpService.get(`/hub/${id}`);
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateHub = createAsyncThunk(
  "appHubs/appUpdateHub",
  async (params) => {
    try {
      const response = await httpService.put(
        `/Hub/${params.id}`,
        {},
        // params
        {
          name: params.name,
          caste: params.caste,
          image: params.image,
          description: params.description
        }
      );
      if (response?.data) {
        toast.success("Community Updated Successfully");
        // params.navigate("/community-setup");
      }
      return await response.data;
      
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteHub = createAsyncThunk(
  "appHubs/appDeleteHub",
  async (id) => {
    try {
      const response = await httpService.delete(`/hub/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Hub Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appMakeHubAdmin = createAsyncThunk(
  "appHubs/appMakeHubAdmin",
  async (params) => { 
    console.log(params)
    try {
      const response = await httpService.post("/hub/makehubadmin", {}, params);
      if (response?.data) {
        toast.success("Hub Assign Successfully");
        // params.navigate("/community-setup");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appAssignHubtoUser = createAsyncThunk(
  "appHubs/appAssignHubtoUser",
  async (params) => { 
    try {
      const response = await httpService.post("/hub/assignhub", {}, params);
      if (response?.data) {
        toast.success("Hub Assign Successfully");
        // params.navigate("/community-setup");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appAssignUser = createAsyncThunk(
  "appHubs/appAssignUser",
  async (params) => { 
    try {
      const response = await httpService.post("/hub", {}, params);
      if (response?.data) {
        toast.success("Successfully Assign user");
        // params.navigate("/community-setup");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

// export const appRemoveUserorAdminHub = createAsyncThunk(
//   "appSanstha/appRemoveUserorAdminHub",
//   async (params) => {
//     console.log(params)
//      try {
//       const response = await httpService.post(
//         `/hub/removeuseroradminfromhub`,
//         {},
//         {
//           userId: params.userId,
//           hubId: params.hubId,
// if(params.admin) {
//   admin: params.admin
// }
//         }
//       );
//       toast.success("Remove admin successfully.");
//       return response.data;
//     } catch (error) {
//       toast.error(error.message);
//       throw error;
//     }
//   }
// );

export const appRemoveUserorAdminHub = createAsyncThunk(
  "appSanstha/appRemoveUserorAdminHub",
  async (params) => {
    try {
      const payload = {
        userId: params.userId,
        hubId: params.hubId,
      };

      if (params.admin) {
        payload.admin = params.admin;
      }

      const response = await httpService.post(
        `/hub/removeuseroradminfromhub`,{},
        payload 
      );

      toast.success("Removed admin successfully.");
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);


export const appRemoveUser = createAsyncThunk( 
  "appHubs/appRemoveUser",
  async (params) => { 
    try {
      const response = await httpService.post("/hub", {}, params);
      if (response?.data) {
        toast.success("Remove User Successfully");
        // params.navigate("/community-setup");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const uploadHubImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response =await httpService.post( `/upload/hub`,{},formData,  { "Content-Type": "multipart/form-data" });
    console.log(response)
 
    return response.data.data.data.file;
    } catch (error) {
    toast.error(error?.message);
    console.error("Upload error:", error);
    throw error;
  }
};

export const appHubSlice = createSlice({
  name: "Hubs",
  initialState: {
    hub: [],
    hubDropdown: [],
    isloder: false,
    paginate: "",
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(isAllOf(appCreateHub.pending), (state) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appCreateHub.fulfilled), (state) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appCreateHub.rejected), (state) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appAssignHubtoUser.pending), (state) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appAssignHubtoUser.fulfilled), (state) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appAssignHubtoUser.rejected), (state) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appAllGetHubs.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(
      isAllOf(appAllGetHubs.fulfilled),
      (state, action) => {
        if (action.meta.arg?.isDropdown) {
          state.hubDropdown = action.payload?.data?.data; 
        } else {
        state.hub = {
          data: action.payload?.data?.data || [],
          pagination: action.payload?.data?.pagination
        };
        const paginate = {
          hasNextPage: action?.payload?.data?.pagination?.totalPages > action?.payload?.data?.pagination?.currentPage,
          hasPrevPage: action?.payload?.data?.pagination?.currentPage > 1,
          limit: action?.payload?.data?.pagination?.pageSize,
          nextPage: action?.payload?.data?.pagination?.currentPage + 1,
          page: action?.payload?.data?.pagination?.currentPage,
          pagingCounter: (action?.payload?.data?.pagination?.currentPage - 1) * action?.payload?.data?.pagination?.pageSize + 1,
          prevPage: action?.payload?.data?.pagination?.currentPage - 1,
          totalDocs: action?.payload?.data?.pagination?.totalRecords,
          totalPages: action?.payload?.data?.pagination?.totalPages,   
        };
        state.paginate = paginate;
      }
        state.isloder = false;
      });
    builder.addMatcher(
      isAllOf(appAllGetHubs.rejected),
      (state, action) => {
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appGetHubById.pending), (state) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetHubById.fulfilled), (state, action) => {
      state.isloder = false;
      state.hubDetails = action.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetHubById.rejected), (state) => {
      state.isloder = false;
    });
    
    builder.addMatcher(isAllOf(appUpdateHub.pending), (state) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appUpdateHub.fulfilled), (state) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appUpdateHub.rejected), (state) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appDeleteHub.pending), (state, action) => {
      state.isloder = true;
      state.isdeleted = false;
    });
    builder.addMatcher(
      isAllOf(appDeleteHub.fulfilled),
      (state, action) => {
        state.isdeleted = true;
        if (Array.isArray(state.hub)) {
          const index = state.hub.findIndex((data) => data?._id === action.payload.id);
          if (index !== -1) {
            state.hub.splice(index, 1);
          }
        }
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appDeleteHub.rejected), (state) => {
      state.isdeleted = false;
      state.isloder = false;
    });
  },
});

export default appHubSlice.reducer;
