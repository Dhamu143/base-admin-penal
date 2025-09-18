import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Import axios directly here

const API_URL = "https://setu.apnamandal.com/api/bhajan";

// Async Thunks now contain the axios calls directly
export const fetchBhajans = createAsyncThunk("bhajans/fetchAll", async () => {
  const response = await axios.get(API_URL);
  return response.data.data.data; // Assumes this is the correct path to your array
});

export const addBhajan = createAsyncThunk("bhajans/add", async (bhajanData) => {
  const response = await axios.post(`${API_URL}/create`, bhajanData);
  return response.data.data;
});

export const updateBhajan = createAsyncThunk(
  "bhajans/update",
  async ({ id, ...bhajanData }) => {
    const response = await axios.put(`${API_URL}/${id}`, bhajanData);
    return response.data.data;
  }
);

export const deleteBhajan = createAsyncThunk("bhajans/delete", async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const bhajanSlice = createSlice({
  name: "bhajans",
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBhajans.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBhajans.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchBhajans.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Add
      .addCase(addBhajan.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Update
      .addCase(updateBhajan.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (bhajan) => bhajan._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteBhajan.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (bhajan) => bhajan._id !== action.payload
        );
      });
  },
});

export default bhajanSlice.reducer;
