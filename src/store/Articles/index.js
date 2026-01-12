import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

export const fetchArticles = createAsyncThunk(
  "articles/fetchArticles",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== "" && v !== undefined && v !== null
          )
        )
      ).toString();
      const url = queryString ? `/articles?${queryString}` : "/articles";
      const response = await httpService.get(url);

      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch articles"
      );
    }
  }
);

export const addArticle = createAsyncThunk(
  "articles/addArticle",
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await httpService.post(
        "/articles/create",
        {},
        articleData
      );
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add article"
      );
    }
  }
);

export const updateArticle = createAsyncThunk(
  "articles/updateArticle",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/articles/${id}`, {}, data);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update article"
      );
    }
  }
);

export const deleteArticle = createAsyncThunk(
  "articles/deleteArticle",
  async (articleId, { rejectWithValue }) => {
    try {
      await httpService.delete(`/articles/${articleId}`);
      return articleId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete article"
      );
    }
  }
);

const initialState = {
  list: [],
  pagination: null,
  status: "idle",
  error: null,
};

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchArticles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })

      .addCase(addArticle.fulfilled, (state, action) => {})

      // Update
      .addCase(updateArticle.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (article) => article._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (article) => article._id !== action.payload
        );
      });
  },
});

export default articlesSlice.reducer;
