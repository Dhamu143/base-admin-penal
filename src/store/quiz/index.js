import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Using axios as defined in your original file

const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
});

// --- ASYNC THUNKS ---

// 🔄 MODIFIED: Thunk now accepts a 'params' object
export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build a dynamic query string from the params
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();

      const url = queryString ? `/quiz?${queryString}` : "/quiz";
      const response = await api.get(url);

      // The backend response structure is slightly different here
      return {
        quizzes: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch quizzes."
      );
    }
  }
);

export const addQuiz = createAsyncThunk(
  "quizzes/add",
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await api.post("/quiz/create", quizData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add quiz."
      );
    }
  }
);

export const updateQuiz = createAsyncThunk(
  "quizzes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/quiz/${id}`, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update quiz."
      );
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  "quizzes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/quiz/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete quiz."
      );
    }
  }
);

// --- SLICE DEFINITION ---

const quizSlice = createSlice({
  name: "quizzes",
  initialState: {
    list: [],
    pagination: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        // 🔄 MODIFIED: Correctly handle the nested payload
        state.list = action.payload.quizzes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })
      .addCase(addQuiz.fulfilled, (state, action) => {
        // In a paginated view, refetching the list is often better
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (quiz) => quiz._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.list = state.list.filter((quiz) => quiz._id !== action.payload);
      });
  },
});

export default quizSlice.reducer;
