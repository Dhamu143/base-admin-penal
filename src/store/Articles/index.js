// store/articles/index.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- Async Thunks ---

// Fetch all articles
export const fetchArticles = createAsyncThunk(
  "articles/fetchArticles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpService.get("/articles");
      return response.data?.data; // Expecting { data: [], pagination: {} }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch articles"
      );
    }
  }
);

// Add a new article
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

// Update an article
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

// Delete an article
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

// --- Slice ---
const initialState = {
  list: [],
  pagination: {},
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
        state.list = action.payload?.data || [];
        state.pagination = action.payload?.pagination || {};
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addArticle.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // Update
      .addCase(updateArticle.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (article) => article._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (article) => article._id !== action.payload
        );
      });
  },
});

export default articlesSlice.reducer;
