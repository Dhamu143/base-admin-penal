import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import mantraService from "../../services/mantraService";

// Async Thunks for CRUD operations
export const fetchMantras = createAsyncThunk("mantras/fetchAll", async () => {
  const mantras = await mantraService.getMantras();
  return mantras;
});

export const addMantra = createAsyncThunk("mantras/add", async (mantraData) => {
  const newMantra = await mantraService.createMantra(mantraData);
  return newMantra;
});

export const updateMantra = createAsyncThunk(
  "mantras/update",
  async ({ id, ...mantraData }) => {
    const updatedMantra = await mantraService.updateMantra(id, mantraData);
    return updatedMantra;
  }
);

export const deleteMantra = createAsyncThunk("mantras/delete", async (id) => {
  await mantraService.deleteMantra(id);
  return id;
});

const mantraSlice = createSlice({
  name: "mantras",
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMantras.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMantras.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchMantras.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Add
      .addCase(addMantra.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Update
      .addCase(updateMantra.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (mantra) => mantra._id === action.payload._id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteMantra.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (mantra) => mantra._id !== action.payload
        );
      });
  },
});

export default mantraSlice.reducer;
