import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateFacility = createAsyncThunk(
  "appFacility/appCreateFacility",
  async (params) => {
    try {
      const response = await httpService.post("/facility", {}, params);
      if (response?.data) {
        toast.success("Facility created Successfully");
        // params.navigate("/native-place");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllFacility = createAsyncThunk(
  "appFacility/appGetAllFacility",
  async (params) => {
    try {
      let url = `/facility?`;
      //  const response = await httpService.get(`/nativeplace?page=${params.page}&limit=${params.limit}`);
      if (params.sanstha) {
        url += `&sanstha=${params.sanstha}`;
      }
      if (params.hub) {
        url += `&hub=${params.hub}`;
      }
      const response = await httpService.get(url);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appUpdateFacility = createAsyncThunk(
  "appFacility/appUpdateFacility",
  async (params) => {
    const { id, ...updateData } = params;
    try {
      const response = await httpService.put(
        `/facility/${params.id}`,
        {},
        updateData
        // {
        //   name: params.name,
        // }
      );
      console.log(response)
      if (response.data) {
        // params.navigate("/native-place/1");
        toast.success("Facility Updated Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteFacility = createAsyncThunk(
  "appFacility/appDeleteFacility",
  async (id) => {
    try {
      const response = await httpService.delete(`/facility/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Facility Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const uploadFacilityImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response =await httpService.post( `/upload/facility`,{},formData,  { "Content-Type": "multipart/form-data" });
    return response.data.data.data.file;

  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const appFacilitySlice = createSlice({
  name: "Facility",
  initialState: {
    facility: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appDeleteFacility.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteFacility.fulfilled), (state, action) => {
      state.isdeleted = true;
      state.facility?.splice(
        state.facility?.findIndex((data) => data?._id === action.payload.id),
        1
      );
    });
    builder.addMatcher(isAllOf(appDeleteFacility.rejected), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appUpdateFacility.fulfilled), (state, action) => {
      const index = state.facility?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.facility[index] = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllFacility.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllFacility.fulfilled), (state, action) => {
      state.facility = action.payload;
   
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
    builder.addMatcher(isAllOf(appGetAllFacility.rejected), (state, action) => {
      state.isloder = false;
    });
  },
});

export default appFacilitySlice.reducer;