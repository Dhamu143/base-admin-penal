// src/store/quiz/index.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Configure your API client
const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
});

// --- ASYNC THUNKS ---

export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/quiz");
      return {
        quizzes: response.data.data.data,
        pagination: response.data.data.pagination,
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
      // CHANGED: The API endpoint for creating a quiz is now correct.
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
      return id; // Return the ID on success for filtering
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
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.quizzes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Quiz
      .addCase(addQuiz.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Update Quiz
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (quiz) => quiz._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete Quiz
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.list = state.list.filter((quiz) => quiz._id !== action.payload);
      });
  },
});

export default quizSlice.reducer;
