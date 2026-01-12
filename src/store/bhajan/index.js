import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const fetchBhajans = createAsyncThunk(
  "bhajans/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_, v]) => v !== "" && v !== null && v !== undefined
        )
      );

      const queryString = new URLSearchParams(cleanParams).toString();
      const url = queryString ? `/bhajan?${queryString}` : "/bhajan";

      const response = await httpService.get(url);

      return response.data;
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
      return response.data?.data || response.data;
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
      return id;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const bhajanSlice = createSlice({
  name: "bhajans",
  initialState: {
    list: [],
    pagination: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBhajans.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBhajans.fulfilled, (state, action) => {
        state.status = "succeeded";

        const apiData = action.payload?.data; 

        if (apiData && Array.isArray(apiData.data)) {
          state.list = apiData.data;
          state.pagination = apiData.pagination || null;
        } else if (Array.isArray(apiData)) {
          state.list = apiData;
          state.pagination = action.payload?.pagination || null;
        } else {
          state.list = [];
        }
      })
      .addCase(fetchBhajans.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.list = [];
      })

      .addCase(addBhajan.fulfilled, (state, action) => {
        if (action.payload) {
          state.list.unshift(action.payload);
        }
      })

      .addCase(updateBhajan.fulfilled, (state, action) => {
        if (action.payload?._id) {
          const index = state.list.findIndex(
            (b) => b._id === action.payload._id
          );
          if (index !== -1) {
            state.list[index] = { ...state.list[index], ...action.payload };
          }
        }
      })

      .addCase(deleteBhajan.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b._id !== action.payload);
      });
  },
});

export default bhajanSlice.reducer;
  