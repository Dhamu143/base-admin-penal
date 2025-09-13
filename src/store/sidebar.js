import { createSlice } from "@reduxjs/toolkit";
export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    collapse: {},
  },
  reducers: {
    setCollapse: (state, action) => {
      state.collapse = action?.payload;
    },
  },
});

export const { setCollapse } = sidebarSlice.actions;

export default sidebarSlice.reducer;
