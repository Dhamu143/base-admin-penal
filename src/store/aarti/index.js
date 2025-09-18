import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// It's best to define this in a central api.js file and import it
const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
});

// --- ASYNC THUNKS FOR THE /aarti ENDPOINT ---

/**
 * Fetch all aartis
 */
export const fetchAartis = createAsyncThunk(
  "aarti/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/aarti");
      // Assuming the response structure is similar to the god endpoint
      return response.data.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch aartis."
      );
    }
  }
);

/**
 * Add a new aarti. The payload must include the `master` ID.
 * @param {object} aartiData - { name, sort, description, language, master }
 */
export const addAarti = createAsyncThunk(
  "aarti/add",
  async (aartiData, { rejectWithValue }) => {
    try {
      const response = await api.post("/aarti/create", aartiData);
      // The response for a single created item might be less nested
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not add aarti."
      );
    }
  }
);

/**
 * Update an existing aarti
 * @param {object} payload - { id, ...aartiData }
 */
export const updateAarti = createAsyncThunk(
  "aarti/update",
  async ({ id, ...aartiData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/aarti/${id}`, aartiData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update aarti."
      );
    }
  }
);

/**
 * Delete an aarti by its ID
 * @param {string} id - The _id of the aarti to delete
 */
export const deleteAarti = createAsyncThunk(
  "aarti/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/aarti/${id}`);
      return id; // Return the ID for easy removal from state
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete aarti."
      );
    }
  }
);

// --- SLICE DEFINITION ---

const aartiSlice = createSlice({
  name: "aarti", // This name will be used in the store
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Aartis
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
      // Add Aarti
      .addCase(addAarti.fulfilled, (state, action) => {
        // Add the new aarti to the list for an immediate UI update
        state.list.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(addAarti.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update Aarti
      .addCase(updateAarti.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (aarti) => aarti._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload; // Update the item
        }
        state.status = "succeeded";
      })
      .addCase(updateAarti.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Aarti
      .addCase(deleteAarti.fulfilled, (state, action) => {
        // Remove the aarti from the list using the returned ID
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
