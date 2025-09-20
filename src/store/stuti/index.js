import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- ASYNC THUNKS FOR THE /stuti ENDPOINT ---

export const fetchStutis = createAsyncThunk(
  "stuti/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      ).toString();
      const url = queryString ? `/stuti?${queryString}` : "/stuti";
      const response = await httpService.get(url);
      return {
        data: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch stutis."
      );
    }
  }
);

export const addStuti = createAsyncThunk(
  "stuti/add",
  async (stutiData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/stuti/create", {}, stutiData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add stuti."
      );
    }
  }
);

export const updateStuti = createAsyncThunk(
  "stuti/update",
  async ({ id, ...stutiData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/stuti/${id}`, {}, stutiData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update stuti."
      );
    }
  }
);

export const deleteStuti = createAsyncThunk(
  "stuti/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/stuti/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete stuti."
      );
    }
  }
);

// --- SLICE ---
const stutiSlice = createSlice({
  name: "stutis",
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
      .addCase(fetchStutis.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStutis.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchStutis.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addStuti.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Update
      .addCase(updateStuti.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteStuti.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      });
  },
});

export default stutiSlice.reducer;
