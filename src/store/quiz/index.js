import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import HttpService from "../../common/http.service";

// --- ASYNC THUNKS ---

export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await HttpService.get("/quiz", params);
      return {
        quizzes: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || "Could not fetch quizzes.");
    }
  }
);

export const addQuiz = createAsyncThunk(
  "quizzes/add",
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await HttpService.post("/quiz/create", {}, quizData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not add quiz.");
    }
  }
);

export const updateQuiz = createAsyncThunk(
  "quizzes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await HttpService.put(`/quiz/${id}`, {}, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not update quiz.");
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  "quizzes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await HttpService.delete(`/quiz/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Could not delete quiz.");
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
        state.list = action.payload.quizzes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })
      .addCase(addQuiz.fulfilled, (state, action) => {
        // Optionally, you can push new quiz or refetch list
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
