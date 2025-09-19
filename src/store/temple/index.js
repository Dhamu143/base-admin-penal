import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// Fetch all temples
export const fetchTemples = createAsyncThunk(
  "temple/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      let url = "/temple?";
      Object.entries(params).forEach(([key, value]) => {
        if (value) url += `${key}=${value}&`;
      });
      const response = await httpService.get(url);
      return Array.isArray(response.data.data.data)
        ? response.data.data.data
        : [];
    } catch (err) {
      return rejectWithValue(err.message || "Could not fetch temples.");
    }
  }
);

// Add temple
export const addTemple = createAsyncThunk(
  "temple/add",
  async (templeData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/temple/create", {}, templeData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not add temple.");
    }
  }
);

// Update temple
export const updateTemple = createAsyncThunk(
  "temple/update",
  async ({ id, ...templeData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/temple/${id}`, {}, templeData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not update temple.");
    }
  }
);

// Delete temple
export const deleteTemple = createAsyncThunk(
  "temple/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/temple/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Could not delete temple.");
    }
  }
);

// Slice
const templeSlice = createSlice({
  name: "temple",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemples.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(addTemple.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list.push(action.payload);
      })
      .addCase(updateTemple.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.list.findIndex(
          (temple) => temple._id === action.payload._id
        );
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteTemple.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = state.list.filter(
          (temple) => temple._id !== action.payload
        );
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      );
  },
});

export default templeSlice.reducer;
