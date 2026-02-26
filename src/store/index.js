// ** Toolkit imports
import { configureStore } from "@reduxjs/toolkit";

// ** Reducers
import auth from "../store/auth/index";
import sidebarReducer from "../store/sidebar";
// import dashboardReducer from "../store/dashboard/index";

import godmaster from "./godmaster";
// import aartisReducer from "./aarti";
// import bhajansReducer from "./bhajan";
// import festivalsReducer from "./festival";
// import mantrasReducer from "./mantra";
import god from "./god";
// import sloks from "./sloks";
import ringtones from "./ringtone";
// import articles from "./Articles";
// import userReducer from "./user2";
// import temple from "./temple";
// import quizReducer from "./quiz";
// import news from "./news";
// import story from "./story";
// import stuti from "./stuti";
import dailyLogReducer from "./dailylog/index";
import postReducer from "./post/index";

export const store = configureStore({
  reducer: {
    auth,
    sidebarReducer,
    // dashboardReducer,

    gods: godmaster,
    // aartis: aartisReducer,
    // bhajans: bhajansReducer,
    // festivals: festivalsReducer,
    // mantras: mantrasReducer,
    God: god,
    // sloks: sloks,
    ringtones,
    // articles,
    // users: userReducer,
    // temple,
    // quizzes: quizReducer,
    // news,
    // story,
    // stuti,
    dailyLog: dailyLogReducer,
    posts: postReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
