import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

export const fetchTemples = createAsyncThunk(
  "temple/fetchAll",
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const paramsWithCacheBuster = {
        ...params,
        _: Date.now(),
      };

      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(paramsWithCacheBuster).filter(([_, v]) => v)
        )
      ).toString();

      const url = `/temple?${queryString}`;
      const response = await httpService.get(url);

      return {
        data: response.data?.data?.data || [],
        pagination: response.data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch temples."
      );
    }
  }
);


export const addTemple = createAsyncThunk(
  "temple/add",
  async (templeData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/temple/create", {}, templeData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add temple."
      );
    }
  }
);

export const updateTemple = createAsyncThunk(
  "temple/update",
  async ({ id, ...templeData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/temple/${id}`, {}, templeData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update temple."
      );
    }
  }
);

export const deleteTemple = createAsyncThunk(
  "temple/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/temple/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete temple."
      );
    }
  }
);

// --- SLICE ---
const templeSlice = createSlice({
  name: "temple",
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
      .addCase(fetchTemples.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTemples.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchTemples.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })
      // Add
      .addCase(addTemple.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // Update
      .addCase(updateTemple.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteTemple.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      });
  },
});

export default templeSlice.reducer;
