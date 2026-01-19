import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

export const createPost = createAsyncThunk(
  "post/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/posts/create", {}, formData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not create post."
      );
    }
  }
);

export const fetchAdminPosts = createAsyncThunk(
  "post/fetchAdminAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== "" && v !== undefined && v !== null
          )
        )
      ).toString();

      const url = queryString
        ? `/posts/admin/all?${queryString}`
        : "/posts/admin/all";

      const response = await httpService.get(url);

      return {
        data: response.data?.data || [],
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 1,
        currentPage: response.data?.currentPage || 1,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch posts."
      );
    }
  }
);

export const verifyPost = createAsyncThunk(
  "post/verify",
  async ({ id, isVerified }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(
        `/posts/admin/verify/${id}`,
        {},
        { isVerified }
      );
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not verify post."
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/posts/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete post."
      );
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    list: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,

    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
        state.totalCount = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAdminPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createPost.fulfilled, (state, action) => {
       
        state.status = "succeeded";
      })

      .addCase(verifyPost.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload; 
        }
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export default postSlice.reducer;
