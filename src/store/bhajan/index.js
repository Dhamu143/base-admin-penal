import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

// --- Async Thunks ---
export const fetchBhajans = createAsyncThunk(
  "bhajans/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpService.get("/bhajan");
      return response.data?.data?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const addBhajan = createAsyncThunk(
  "bhajans/add",
  async (bhajanData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/bhajan/create", {}, bhajanData);
      // toast.success("Bhajan added successfully!");
      return response.data?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const updateBhajan = createAsyncThunk(
  "bhajans/update",
  async ({ id, ...bhajanData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/bhajan/${id}`, {}, bhajanData);
      // toast.success("Bhajan updated successfully!");
      return response.data?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const deleteBhajan = createAsyncThunk(
  "bhajans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/bhajan/${id}`);
      // toast.success("Bhajan deleted successfully!");
      return id;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

// --- Slice ---
export const bhajanSlice = createSlice({
  name: "bhajans",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addMatcher(isAllOf(fetchBhajans.pending), (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addMatcher(isAllOf(fetchBhajans.fulfilled), (state, action) => {
      state.status = "succeeded";
      state.list = action.payload;
    });
    builder.addMatcher(isAllOf(fetchBhajans.rejected), (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    // Add
    builder.addMatcher(isAllOf(addBhajan.fulfilled), (state, action) => {
      state.list.push(action.payload);
    });

    // Update
    builder.addMatcher(isAllOf(updateBhajan.fulfilled), (state, action) => {
      const index = state.list.findIndex(
        (bhajan) => bhajan._id === action.payload._id
      );
      if (index !== -1) state.list[index] = action.payload;
    });

    // Delete
    builder.addMatcher(isAllOf(deleteBhajan.fulfilled), (state, action) => {
      state.list = state.list.filter((bhajan) => bhajan._id !== action.payload);
    });
  },
});

export default bhajanSlice.reducer;
