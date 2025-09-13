import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateFaq = createAsyncThunk(
  "appFaq/appCreateFaq",
  async (params) => {
    try {
      const response = await httpService.post("/faq", {}, params);
      if (response?.data) {
        toast.success("Faq created Successfully");
        params.navigate("/faq");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appGetAllFaq = createAsyncThunk(
  "appFaq/appGetAllFaq",
  async (params) => {
    console.log(params)
    try {
      const searchQuery = params.search ? `&search=${encodeURIComponent(params.search)}` : '';
      const response = await httpService.get(`/faq?page=${params.page}&limit=10${searchQuery}`);
      console.log(response)
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateFaq = createAsyncThunk(
  "appFaq/appUpdateFaq",
  async (params) => {
    try {
      const response = await httpService.put(
        `/faq/${params.id}`,
        {},
        // params
        {
          question: params.question,
          answer: params.answer,
          isActive: params.isActive,
          sort: params.sort,
        }
      );
      if (response.data) {
        params.navigate("/faq/1");
        toast.success("Faq Updated Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteFaq = createAsyncThunk(
  "appFaq/appDeleteFaq",
  async (id) => {
    try {
      const response = await httpService.delete(`/faq/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Faq Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appFaqSlice = createSlice({
  name: "Faq",
  initialState: {
    faq: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appDeleteFaq.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteFaq.fulfilled), (state, action) => {
      state.isdeleted = true;
      state.faq?.splice(
        state.faq?.findIndex((data) => data?._id === action.payload.id),
        1
      );
    });
    builder.addMatcher(isAllOf(appDeleteFaq.rejected), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appUpdateFaq.fulfilled), (state, action) => {
      const index = state.faq?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.faq[index] = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllFaq.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllFaq.fulfilled), (state, action) => {
      state.faq = action.payload;
   
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
    builder.addMatcher(isAllOf(appGetAllFaq.rejected), (state, action) => {
      state.isloder = false;
    });
  },
});

export default appFaqSlice.reducer;
