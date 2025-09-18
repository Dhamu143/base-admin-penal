// src/store/user/index.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "https://setu.apnamandal.com/api",
});

// --- ASYNC THUNKS FOR THE /users ENDPOINT ---

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users");
      // Return both the user list and the pagination info
      console.log("users", response);
      return {
        users: response.data.data.data,
        pagination: response.data.data.pagination,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch users."
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      // Assuming the delete endpoint is /users/:id
      await api.delete(`/users/${id}`);
      return id; // Return the ID on success for filtering
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not delete user."
      );
    }
  }
);

// --- SLICE DEFINITION ---

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    pagination: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
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
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        // You can set an error state here if needed
        console.error("Delete failed:", action.payload);
      });
  },
});

export default userSlice.reducer;
