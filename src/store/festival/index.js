import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Import axios directly

// The API URL is now defined in the slice
const API_URL = "https://setu.apnamandal.com/api/festival";

// Async Thunks now contain the axios calls
export const fetchFestivals = createAsyncThunk(
  "festivals/fetchAll",
  async () => {
    const response = await axios.get(API_URL);
    return response.data.data.data;
  }
);

export const addFestival = createAsyncThunk(
  "festivals/add",
  async (festivalData) => {
    const response = await axios.post(`${API_URL}/create`, festivalData);
    return response.data.data;
  }
);

export const updateFestival = createAsyncThunk(
  "festivals/update",
  async ({ id, ...festivalData }) => {
    const response = await axios.put(`${API_URL}/${id}`, festivalData);
    return response.data.data;
  }
);

export const deleteFestival = createAsyncThunk(
  "festivals/delete",
  async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

const festivalSlice = createSlice({
  name: "festivals",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All the reducer logic remains exactly the same
      .addCase(fetchFestivals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFestivals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchFestivals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addFestival.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateFestival.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (festival) => festival._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteFestival.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (festival) => festival._id !== action.payload
        );
      });
  },
});

export default festivalSlice.reducer;
