import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- ASYNC THUNKS FOR THE /news ENDPOINT ---

// Fetch all news with optional filter parameters
export const fetchNews = createAsyncThunk(
  // <-- Changed
  "news/fetchAll", // <-- Changed
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();

      const url = queryString ? `/news?${queryString}` : "/news"; // <-- Changed
      const response = await httpService.get(url);

      return {
        data: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch news." // <-- Changed
      );
    }
  }
);

// Add a new news item
export const addNews = createAsyncThunk(
  // <-- Changed
  "news/add", // <-- Changed
  async (newsData, { rejectWithValue }) => {
    // <-- Changed
    try {
      const response = await httpService.post("/news/create", {}, newsData); // <-- Changed
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add news item." // <-- Changed
      );
    }
  }
);

// Update an existing news item
export const updateNews = createAsyncThunk(
  // <-- Changed
  "news/update", // <-- Changed
  async ({ id, ...newsData }, { rejectWithValue }) => {
    // <-- Changed
    try {
      const response = await httpService.put(`/news/${id}`, {}, newsData); // <-- Changed
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update news item." // <-- Changed
      );
    }
  }
);

// Delete a news item
export const deleteNews = createAsyncThunk(
  // <-- Changed
  "news/delete", // <-- Changed
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/news/${id}`); // <-- Changed
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete news item." // <-- Changed
      );
    }
  }
);

// --- SLICE ---
const newsSlice = createSlice({
  // <-- Changed
  name: "news", // <-- Changed
  initialState: {
    list: [],
    pagination: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNews.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addNews.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addNews.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateNews.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default newsSlice.reducer;
