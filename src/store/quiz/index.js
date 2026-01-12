import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import HttpService from "../../common/http.service";

export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== "" && v !== undefined && v !== null
          )
        )
      ).toString();

      const url = queryString ? `/quiz?${queryString}` : "/quiz";

      const response = await HttpService.get(url);

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
  async ({ id, ...data }, { rejectWithValue }) => {
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
        state.list.push(action.payload);
      })

      // ✅ UPDATE WITH GOD PRESERVATION LOGIC
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (quiz) => quiz._id === action.payload._id
        );
        if (index !== -1) {
          const existingItem = state.list[index];
          const updatedItem = action.payload;

          // Preserve God Object Logic
          let preservedGod = updatedItem.god;
          if (
            typeof updatedItem.god === "string" &&
            existingItem.god &&
            typeof existingItem.god === "object"
          ) {
            // Only preserve if IDs match
            if (existingItem.god._id === updatedItem.god) {
              preservedGod = existingItem.god;
            }
          }

          state.list[index] = {
            ...updatedItem,
            god: preservedGod,
          };
        }
      })

      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.list = state.list.filter((quiz) => quiz._id !== action.payload);
      });
  },
});

export default quizSlice.reducer;
