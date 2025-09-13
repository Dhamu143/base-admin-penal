// ** Toolkit imports
import { configureStore } from "@reduxjs/toolkit";

// ** Reducers
import auth from "../store/auth/index";
import sidebarReducer from "../store/sidebar";
import hubReducer from "../store/hubs/index";
import languageReducer from "../store/language/index";
import religionReducer from "../store/religion/index";
import nativeplaceReducer from "../store/nativeplace/index";
import casteReducer from "../store/caste/index";
import requestedhubReducer from "../store/requestedhub/index";
import faqReducer from "../store/faq/index";
import usersReducer from "../store/user/index";
import sansthaReducer from "../store/sanstha/index";
import sponsorReducer from "../store/sponsor/index";
import teamsReducer from "../store/teams/index";
import dashboardReducer from "../store/dashboard/index";
import paymentSettingsReducer from "../store/paymentsetting/index";
import facilityReducer from "../store/facilities/index";
import complianceDateReducer from "../store/compliancesDate/index";
import complianceReducer from "../store/compliances/index";
import facilitybookingReducer from "../store/facilitybooking/index";
import contributionReducer from  "../store/contribution/index";
import PendingMembershipReducer from "../store/pendingmembers/index";
import fundrasingReducer from "../store/fundrasing/index";
import postReducer from "../store/post/index";
import projectcategoryReducer from "../store/projectcategory/index";
import socialprojectReducer from "../store/socialproject/index";
import socialprojectbookingReducer from "../store/socialprojectbooking/index";
import eventReducer from "../store/event/index";
import bolibookingReducer from "../store/boliBooking/index";
import directoriesReducer from "../store/directories/directories";

export const store = configureStore({
  reducer: {
    auth,
    sidebarReducer,
    dashboardReducer,
    casteReducer,
    hubReducer,
    sponsorReducer,
    sansthaReducer,
    paymentSettingsReducer,
    requestedhubReducer,
    facilityReducer,
    teamsReducer,
    postReducer,
    projectcategoryReducer,
    socialprojectReducer,
    PendingMembershipReducer,
    eventReducer,
    bolibookingReducer,
    fundrasingReducer,
    facilitybookingReducer,
    directoriesReducer,
    socialprojectbookingReducer,
    contributionReducer,
    complianceDateReducer,
    complianceReducer,
    faqReducer,
    usersReducer,
    languageReducer,
    religionReducer,
    nativeplaceReducer,
  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
