import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateReligion = createAsyncThunk(
  "appReligion/appCreateReligion",
  async (params) => {
    try {
      const response = await httpService.post("/religion", {}, params);
      if (response?.data) {
        toast.success("Religion created Successfully");
        params.navigate("/religion");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appGetAllReligion = createAsyncThunk(
  "appReligion/appGetAllReligion",
  async (params) => {
    try {
      const response = await httpService.get(`/religion?page=${params.page}&limit=${params.limit}`);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateReligion = createAsyncThunk(
  "appReligion/appUpdateReligion",
  async (params) => {
    try {
      const response = await httpService.put(
        `/religion/${params.id}`,
        {},
        {
          name: params.name,
        }
      );
      if (response.data) {
        params.navigate("/religion/1");
        toast.success("Religion Updated Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteReligion = createAsyncThunk(
  "appReligion/appDeleteReligion",
  async (id) => {
    try {
      const response = await httpService.delete(`/religion/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Religion Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appReligionSlice = createSlice({
  name: "Religion",
  initialState: {
    religion: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(isAllOf(appGetAllReligion.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllReligion.fulfilled), (state, action) => {
      state.religion = action.payload;
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
    builder.addMatcher(isAllOf(appGetAllReligion.rejected), (state, action) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appDeleteReligion.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteReligion.fulfilled), (state, action) => {
      state.isdeleted = true;
      state.religion?.splice(
        state.religion?.findIndex((data) => data?._id === action.payload.id),
        1
      );
    });
    builder.addMatcher(isAllOf(appDeleteReligion.rejected), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appUpdateReligion.fulfilled), (state, action) => {
      const index = state.religion?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.religion[index] = action?.payload?.data;
    });
  },
});

export default appReligionSlice.reducer;
