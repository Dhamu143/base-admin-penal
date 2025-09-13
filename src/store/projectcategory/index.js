import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateProjectCategory = createAsyncThunk(
  "appProjectCategory/ProjectCategory",
  async (params) => {
    try {
      const response = await httpService.post("/projectcategory", {}, params);
      if (response?.data) {
        toast.success("project category created Successfully");
        // params.navigate("/post");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllProjectCategory = createAsyncThunk(
  "appProjectCategory/appGetAllProjectCategory",
  async (params) => {
    try {
      // const response = await httpService.get(`/post?page=${params.page}&limit=${params.limit}`);
      let url = `/projectcategory?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hub=${params.hub}`;
      }
      if (params.sanstha) {
        url += `&sanstha=${params.sanstha}`;
      }
        if (params.category) {
        url += `&category=${params.category}`;
      }
       const response = await httpService.get(url);  
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateProjectCategory = createAsyncThunk(
  "appProjectCategory/appUpdateProjectCategory",
  async (params) => {
    try {
      const response = await httpService.put(
        `/projectcategory/${params.id}`,
        {},
        // params
        {
        name: params.name,
        }
      );
      if (response.data) {
        // params.navigate("/post/1");
        toast.success("project category Updated Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteProjectCategory = createAsyncThunk(
  "appProjectCategory/appDeleteProjectCategory",
  async (id) => {
    try {
      const response = await httpService.delete(`/projectcategory/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("project category Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appProjectCategorySlice = createSlice({
  name: "project Category",
  initialState: {
    projectcategory: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appDeleteProjectCategory.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteProjectCategory.fulfilled), (state, action) => {
      state.isdeleted = true;
      if (Array.isArray(state.projectcategory)) {
          const index = state.projectcategory.findIndex((data) => data?._id === action.payload.id);
          if (index !== -1) {
            state.projectcategory.splice(index, 1);
          }
        }
    });
    builder.addMatcher(isAllOf(appDeleteProjectCategory.rejected), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appUpdateProjectCategory.fulfilled), (state, action) => {
      const index = state.projectcategory.data?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.projectcategory.data[index] = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllProjectCategory.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllProjectCategory.fulfilled), (state, action) => {
      state.projectcategory = action.payload;
  
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
    builder.addMatcher(isAllOf(appGetAllProjectCategory.rejected), (state, action) => {
      state.isloder = false;
    });
  },
});

export default appProjectCategorySlice.reducer;
