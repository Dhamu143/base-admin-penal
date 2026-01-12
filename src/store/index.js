// ** Toolkit imports
import { configureStore } from "@reduxjs/toolkit";

// ** Reducers
import auth from "../store/auth/index";
import sidebarReducer from "../store/sidebar";
import dashboardReducer from "../store/dashboard/index";
// import hubReducer from "../store/hubs/index";
// import languageReducer from "../store/language/index";
// import religionReducer from "../store/religion/index";
// import nativeplaceReducer from "../store/nativeplace/index";
// import casteReducer from "../store/caste/index";
// import requestedhubReducer from "../store/requestedhub/index";
// import faqReducer from "../store/faq/index";
// import usersReducer from "../store/user/index";
// import sansthaReducer from "../store/sanstha/index";
// import sponsorReducer from "../store/sponsor/index";
// import teamsReducer from "../store/teams/index";

// import paymentSettingsReducer from "../store/paymentsetting/index";
// import facilityReducer from "../store/facilities/index";
// import complianceDateReducer from "../store/compliancesDate/index";
// import complianceReducer from "../store/compliances/index";
// import facilitybookingReducer from "../store/facilitybooking/index";
// import contributionReducer from "../store/contribution/index";
// import PendingMembershipReducer from "../store/pendingmembers/index";
// import fundrasingReducer from "../store/fundrasing/index";
// import postReducer from "../store/post/index";
// import projectcategoryReducer from "../store/projectcategory/index";
// import socialprojectReducer from "../store/socialproject/index";
// import socialprojectbookingReducer from "../store/socialprojectbooking/index";
// import eventReducer from "../store/event/index";
// import bolibookingReducer from "../store/boliBooking/index";
// import directoriesReducer from "../store/directories/directories";
import godmaster from "./godmaster";
import aartisReducer from "./aarti";
import bhajansReducer from "./bhajan";
import festivalsReducer from "./festival";
import mantrasReducer from "./mantra";
import god from "./god";
import sloks from "./sloks";
import ringtones from "./ringtone";
import articles from "./Articles";
import userReducer from "./user2";
import temple from "./temple";
import quizReducer from "./quiz";
import news from "./news";
import story from "./story";
import stuti from "./stuti";
import dailyLogReducer from "./dailylog/index";

export const store = configureStore({
  reducer: {
    auth,
    sidebarReducer,
    dashboardReducer,
    // casteReducer,
    // hubReducer,
    // sponsorReducer,
    // sansthaReducer,
    // paymentSettingsReducer,
    // requestedhubReducer,
    // facilityReducer,
    // teamsReducer,
    // postReducer,
    // projectcategoryReducer,
    // socialprojectReducer,
    // PendingMembershipReducer,
    // eventReducer,
    // bolibookingReducer,
    // fundrasingReducer,
    // facilitybookingReducer,
    // directoriesReducer,
    // socialprojectbookingReducer,
    // contributionReducer,
    // complianceDateReducer,
    // complianceReducer,
    // faqReducer,
    // usersReducer,
    // languageReducer,
    // religionReducer,
    // nativeplaceReducer,
    gods: godmaster,
    aartis: aartisReducer,
    bhajans: bhajansReducer,
    festivals: festivalsReducer,
    mantras: mantrasReducer,
    God: god,
    sloks: sloks,
    ringtones,
    articles,
    users: userReducer,
    temple,
    quizzes: quizReducer,
    news,
    story,
    stuti,
    dailyLog: dailyLogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
