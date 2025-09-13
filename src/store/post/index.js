import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreatePost = createAsyncThunk(
  "appPost/appCreatePost",
  async (params) => {
    try {
      const response = await httpService.post("/post", {}, params);
      if (response?.data) {
        toast.success("Post created Successfully");
        // params.navigate("/post");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllPost = createAsyncThunk(
  "appPost/appGetAllPost",
  async (params) => {
    try {
      // const response = await httpService.get(`/post?page=${params.page}&limit=${params.limit}`);
      let url = `/post?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hub=${params.hub}`;
      }
      if (params.sanstha) {
        url += `&sanstha=${params.sanstha}`;
      }
        if (params.categoryOptions) {
        url += `&category=${params.categoryOptions}`;
      }
         if (params.approval_required) {
        url += `&approval_required=${params.approval_required}`;
      }
       const response = await httpService.get(url);  
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdatePost = createAsyncThunk(
  "appPost/appUpdatePost",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/post/${params.id}`,
        {},
        // params
        {
        title: params.title,
        file: params?.file,
        description: params?.description,
        category: params?.category,
        sanstha: params?.sanstha,
        hub: params?.hub,
        approval_required: params?.approval_required
        }
      );
      if (response.data) {
        // params.navigate("/post/1");
        toast.success("Post Updated Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeletePost = createAsyncThunk(
  "appPost/appDeletePost",
  async (id) => {
    try {
      const response = await httpService.delete(`/post/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Post Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appPostSlice = createSlice({
  name: "Post",
  initialState: {
    post: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appDeletePost.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeletePost.fulfilled), (state, action) => {
      state.isdeleted = true;
      if (Array.isArray(state.post)) {
          const index = state.post.findIndex((data) => data?._id === action.payload.id);
          if (index !== -1) {
            state.post.splice(index, 1);
          }
        }
    });
    builder.addMatcher(isAllOf(appDeletePost.rejected), (state, action) => {
      state.isdeleted = false;
    });
    // builder.addMatcher(isAllOf(appUpdatePost.fulfilled), (state, action) => {
    //   const index = state.post?.findIndex(
    //     (data) => data?._id === action?.payload?.data?._id
    //   );
    //   state.post[index] = action?.payload?.data;
    // });
       builder.addMatcher(isAllOf(appUpdatePost.fulfilled), (state, action) => {
      const index = state.post?.data?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
    
      if (index !== -1) {
        state.post.data[index] = action?.payload?.data;
      }
    });
    builder.addMatcher(isAllOf(appGetAllPost.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllPost.fulfilled), (state, action) => {
      state.post = action.payload;
  
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
    builder.addMatcher(isAllOf(appGetAllPost.rejected), (state, action) => {
      state.isloder = false;
    });
  },
});

export default appPostSlice.reducer;
