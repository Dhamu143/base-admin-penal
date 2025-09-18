// store/articles/index.js (or articlesSlice.js)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- Axios instance ---
const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Async Thunks ---

// Fetch all articles
export const fetchArticles = createAsyncThunk(
  "articles/fetchArticles",
  async (_, { rejectWithValue }) => {
    try {
      // NOTE: API endpoint is case-sensitive
      const response = await api.get("/articles");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Add a new article
export const addArticle = createAsyncThunk(
  "articles/addArticle",
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/Articles/create", articleData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update an existing article
export const updateArticle = createAsyncThunk(
  "articles/updateArticle",
  async (articleData, { rejectWithValue }) => {
    try {
      const { id, ...data } = articleData;
      const response = await api.put(`/articles/${id}`, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete an article
export const deleteArticle = createAsyncThunk(
  "articles/deleteArticle",
  async (articleId, { rejectWithValue }) => {
    try {
      await api.delete(`/articles/${articleId}`);
      return articleId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Slice Definition ---
const initialState = {
  list: [],
  pagination: {},
  status: "idle", // 'idle', 'loading', 'succeeded', 'failed'
  error: null,
};

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchArticles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data || [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch articles";
      })

      // --- Add ---
      .addCase(addArticle.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // --- Update ---
      .addCase(updateArticle.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (article) => article._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // --- Delete ---
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (article) => article._id !== action.payload
        );
      });
  },
});

export default articlesSlice.reducer;
