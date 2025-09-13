import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateNativePlace = createAsyncThunk(
  "appNativePlace/appCreateNativePlace",
  async (params) => {
    try {
      const response = await httpService.post("/nativeplace", {}, params);
      if (response?.data) {
        toast.success("Native Place created Successfully");
        params.navigate("/native-place");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllNativePlace = createAsyncThunk(
  "appNativePlace/appGetAllNativePlace",
  async (params) => {
    try {
      let url = `/nativeplace?page=${params.page}&limit=${params.limit}`;
      //  const response = await httpService.get(`/nativeplace?page=${params.page}&limit=${params.limit}`);
      if (params.nativeplaceDropdown) {
        url += `&nativeplace=${params.nativeplaceDropdown}`;
      }
      const response = await httpService.get(url);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);
export const appGetAllNativePlaceDropdown = createAsyncThunk(
  "appNativePlace/appGetAllNativePlaceDropdown",
  async (params) => {
    try {
      const response = await httpService.get(`/nativeplace?page=${params.page}&limit=${params.limit}`);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateNativePlace = createAsyncThunk(
  "appNativePlace/appUpdateNativePlace",
  async (params) => {
    try {
      const response = await httpService.put(
        `/nativeplace/${params.id}`,
        {},
        // params
        {
          name: params.name,
        }
      );
      if (response.data) {
        params.navigate("/native-place/1");
        toast.success("Native Place Updated Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteNativePlace = createAsyncThunk(
  "appNativePlace/appDeleteNativePlace",
  async (id) => {
    try {
      const response = await httpService.delete(`/nativeplace/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Native Place Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appNativePlaceSlice = createSlice({
  name: "NativePlace",
  initialState: {
    nativeplace: [],
    nativeplaceDropdown: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appDeleteNativePlace.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteNativePlace.fulfilled), (state, action) => {
      state.isdeleted = true;
      state.nativeplace?.splice(
        state.nativeplace?.findIndex((data) => data?._id === action.payload.id),
        1
      );
    });
    builder.addMatcher(isAllOf(appDeleteNativePlace.rejected), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appUpdateNativePlace.fulfilled), (state, action) => {
      const index = state.nativeplace?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.nativeplace[index] = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllNativePlace.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllNativePlace.fulfilled), (state, action) => {
      state.nativeplace = action.payload;
   
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
    builder.addMatcher(isAllOf(appGetAllNativePlace.rejected), (state, action) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetAllNativePlaceDropdown.fulfilled), (state, action) => {
      state.nativeplaceDropdown = action.payload?.data || [];
    });
  },
});

export default appNativePlaceSlice.reducer;
