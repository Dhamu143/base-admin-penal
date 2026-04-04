// ** Toolkit imports
import { configureStore } from "@reduxjs/toolkit";

// ** Reducers
import auth from "../store/auth/index";
import sidebarReducer from "../store/sidebar";

export const store = configureStore({
  reducer: {
    auth,
    sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
