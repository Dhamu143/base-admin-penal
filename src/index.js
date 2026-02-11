import React from "react";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { createRoot } from "react-dom/client";
// import { SocketContext, socket } from "./context/socket";

// 1. Import Query Client
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 2. Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Optional: prevent refetch on window focus
      retry: 1,
    },
  },
});

const root = createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    {/* 3. Wrap App with QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      {/* <SocketContext.Provider value={socket}> */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      {/* </SocketContext.Provider> */}
    </QueryClientProvider>
  </Provider>
  // </React.StrictMode>
);

reportWebVitals();