import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

// --- ASYNC THUNKS FOR THE /aarti ENDPOINT ---

// Fetch all aartis
export const fetchAartis = createAsyncThunk(
  "aarti/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpService.get("/aarti");
      return response.data?.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch aartis."
      );
    }
  }
);

// Add a new aarti
export const addAarti = createAsyncThunk(
  "aarti/add",
  async (aartiData, { rejectWithValue }) => {
    try {
      const response = await httpService.post("/aarti/create", {}, aartiData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add aarti."
      );
    }
  }
);

// Update an existing aarti
export const updateAarti = createAsyncThunk(
  "aarti/update",
  async ({ id, ...aartiData }, { rejectWithValue }) => {
    try {
      const response = await httpService.put(`/aarti/${id}`, {}, aartiData);
      return response.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update aarti."
      );
    }
  }
);

// Delete an aarti
export const deleteAarti = createAsyncThunk(
  "aarti/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/aarti/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete aarti."
      );
    }
  }
);

// --- SLICE ---
const aartiSlice = createSlice({
  name: "aarti",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAartis.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAartis.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAartis.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addAarti.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(addAarti.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateAarti.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (aarti) => aarti._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.status = "succeeded";
      })
      .addCase(updateAarti.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteAarti.fulfilled, (state, action) => {
        state.list = state.list.filter((aarti) => aarti._id !== action.payload);
        state.status = "succeeded";
      })
      .addCase(deleteAarti.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default aartiSlice.reducer;
