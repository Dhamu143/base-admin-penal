import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";


export const fetchStories = createAsyncThunk(
  "story/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();

      const url = queryString ? `/story?${queryString}` : "/story";
      const response = await httpService.get(url);

      return {
        data: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch stories."
      );
    }
  }
);

export const addStory = createAsyncThunk(
  "story/add",
  async (storyData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/story/create", {}, storyData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add story."
      );
    }
  }
);

export const updateStory = createAsyncThunk(
  "story/update",
  async ({ id, ...storyData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/story/${id}`, {}, storyData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update story."
      );
    }
  }
);

export const deleteStory = createAsyncThunk(
  "story/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/story/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete story."
      );
    }
  }
);

const storySlice = createSlice({
  name: "story",
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
      .addCase(fetchStories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addStory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addStory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateStory.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateStory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteStory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default storySlice.reducer;
