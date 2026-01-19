import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

export const fetchNews = createAsyncThunk(
  "news/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== "" && v !== undefined && v !== null
          )
        )
      ).toString();
      const url = queryString ? `/news?${queryString}` : "/news";
      const response = await httpService.get(url);

      return {
        data: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch news."
      );
    }
  }
);

export const addNews = createAsyncThunk(
  "news/add",
  async (newsData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/news/create", {}, newsData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add news item."
      );
    }
  }
);

export const updateNews = createAsyncThunk(
  "news/update", 
  async ({ id, ...newsData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/news/${id}`, {}, newsData); 
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update news item."
      );
    }
  }
);

export const deleteNews = createAsyncThunk(
  "news/delete", 
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/news/${id}`); 
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete news item."
      );
    }
  }
);

const newsSlice = createSlice({
  name: "news", 
  initialState: {
    list: [],
    pagination: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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

      .addCase(addNews.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addNews.rejected, (state, action) => {
        state.error = action.payload;
      })

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

      .addCase(deleteNews.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default newsSlice.reducer;
