import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateProject = createAsyncThunk(
  "appProject/appCreateProject",
  async (params) => {
    try {
      const response = await httpService.post("/project", {}, params);
      if (response?.data) {
        toast.success("project created Successfully");
        // params.navigate("/post");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllProject = createAsyncThunk(
  "appProject/appGetAllProject",
  async (params) => {
    try {
      // const response = await httpService.get(`/post?page=${params.page}&limit=${params.limit}`);
      let url = `/project?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hubId=${params.hub}`;
      }
      if (params.sanstha) {
        url += `&sansthaId=${params.sanstha}`;
      }
            if (params.category) {
        url += `&category=${params.category}`;
      }
            if (params.projectId) {
        url += `&projectId=${params.projectId}`;
      }
       if (params.startDate) {
        url += `&startDate=${params.startDate}`;
      }   
      if (params.endDate) {
        url += `&endDate=${params.endDate}`;
      }
       if (params.status) {
        url += `&status=${params.status}`;
      }
       const response = await httpService.get(url);  
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateProject = createAsyncThunk(
  "appProject/appUpdateProject",
  async (params) => {
    try {
      const response = await httpService.put(
        `/project/${params.id}`,
        {},
        // params
        {
        title: params.title,
        file: params.file,
        description: params.description,
        category: params.category,
        sanstha: params.sanstha,
        hub: params.hub,
        status: params.status,
        isOngoing: params.isOngoing,
        visibility_private: params.visibility_private,
        startDate: params.startDate,
        endDate: params.endDate,
        goalamount: params.goalamount,
        pincode: params?.pincode,
        area: params?.area,
        state: params?.state,
        district: params?.district,
        block: params?.block,
        placeAddress: params?.placeAddress,
        eligibility80G: params?.eligibility80G,
        allowDonations: params?.allowDonations,
        upload_report: params.upload_report,
        pancardnumber: params.pancardnumber,
        }
      );
      if (response.data) {
        // params.navigate("/post/1");
        toast.success("social project Updated Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteProject = createAsyncThunk(
  "appProject/appDeleteProject",
  async (id) => {
    try {
      const response = await httpService.delete(`/project/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("social project Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appProjectSlice = createSlice({
  name: "Social Project",
  initialState: {
    socialproject: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appDeleteProject.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteProject.fulfilled), (state, action) => {
      state.isdeleted = true;
      if (Array.isArray(state.socialproject)) {
          const index = state.socialproject.findIndex((data) => data?._id === action.payload.id);
          if (index !== -1) {
            state.socialproject.splice(index, 1);
          }
        }
    });
    builder.addMatcher(isAllOf(appDeleteProject.rejected), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appUpdateProject.fulfilled), (state, action) => {
  const index = state.socialproject?.data?.findIndex(
    (data) => data?._id === action?.payload?.data?._id
  );

  if (index !== -1) {
    state.socialproject.data[index] = action?.payload?.data;
  }
});

    // builder.addMatcher(isAllOf(appUpdateProject.fulfilled), (state, action) => {
    //   const index = state.socialproject?.findIndex(
    //     (data) => data?._id === action?.payload?.data?._id
    //   );
    //   state.socialproject[index] = action?.payload?.data;
    // });
    builder.addMatcher(isAllOf(appGetAllProject.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllProject.fulfilled), (state, action) => {
      state.socialproject = action.payload;
  
      const paginate = {
        hasNextPage: action?.payload?.pagination?.totalPages > action?.payload?.pagination?.currentPage,
        hasPrevPage: action?.payload?.pagination?.currentPage > 1,
        limit: action?.payload?.pagination?.pageSize || 10,
        nextPage: action?.payload?.pagination?.currentPage ? action?.payload?.pagination?.currentPage + 1 : 1,
        page: action?.payload?.pagination?.currentPage || 1,
        pageSize: action?.payload?.pagination?.pageSize || 10,
        pagingCounter: action?.payload?.pagination?.currentPage ? (action?.payload?.pagination?.currentPage - 1) * action?.payload?.pagination?.pageSize + 1 : 1,
        prevPage: action?.payload?.pagination?.currentPage ? action?.payload?.pagination?.currentPage - 1 : 0,
        totalDocs: action?.payload?.pagination?.totalRecords || action?.payload?.data?.length || 0,
        totalPages: action?.payload?.pagination?.totalPages || Math.ceil((action?.payload?.data?.length || 0) / 10)
      };
      state.paginate = paginate;
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetAllProject.rejected), (state, action) => {
      state.isloder = false;
    });
  },
});

export default appProjectSlice.reducer;
