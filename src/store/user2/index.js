import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import httpService from "../../common/http.service";

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await httpService.get("/users", { params });
      return {
        users: response.data.data.data,
        pagination: response.data.data.pagination,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Could not fetch users.");
    }
  }
);

// 2. Delete a user
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await httpService.delete(`/users/${id}`);
      return id; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Could not delete user.");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    pagination: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        console.error("Delete failed:", action.payload);
      });
  },
});

export default userSlice.reducer;