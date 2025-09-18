import { Fragment, useEffect, useRef } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "./App.css";
import Login from "./pages/login";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import ProtectedRoute from "./routes/protectedRoute";
import PrivateRoute from "./routes/privateRoute";
import Dashboard from "./pages/dashboard";
import SignUp from "./pages/signUp";
import { IsTokenExpired } from "./common/jwtToken";
import { SocketContext } from "./context/socket";
import { useContext } from "react";
import { useDispatch } from "react-redux";

import Language from "./pages/language";

import NewLanguage from "./pages/language/add";

import GlobalLoader from "./components/GlobalLoader";

import Faq from "./pages/faq";
import User from "./pages/users/index";
import NewUser from "./pages/users/add";

import NewFaq from "./pages/faq/add";

import Teams from "./pages/teams/index";
import TeamsForm from "./pages/teams/teamsform";
import UserDetails from "./pages/users/userDetails";
import Support from "./pages/support";
import Announcement from "./pages/announcement";
import Paymentsetting from "./pages/paymentsetting/index";
import Offer from "./pages/offer";
import ComplianceDate from "./pages/complianceDate/index";
import NewComplianceDate from "./pages/complianceDate/add";

import RequstedUser from "./pages/RequstedUser";
import PaymentHistory from "./pages/Payment-History";
import NewPost from "./pages/post/add";
import Post from "./pages/post";

import NewEvent from "./pages/events/add";
import Event from "./pages/events";

import GodMaster from "./pages/god-Master";
import AartiManagementPage from "./pages/AartiManagementPage/index.js";
import BhajanManagementPage from "./pages/Bhajan/index.js";
import FestivalManagementPage from "./pages/FestivalManagementPage/index.js";
import MantraManagementPage from "./pages/MantraManagementPage/index.js";
import GodManagementPage from "./pages/GodManagementPage/index.js";
import SlokManagementPage from "./pages/SlokManagementPage/index.js";
import RingtoneManagementPage from "./pages/RingtoneManagementPage/index.js";
import ArticleManagementPage from "./pages/ArticleManagementPage/index.js";
import UserManagementPage from "./pages/UserManagementPage/index.js";
import TempleManagementPage from "./pages/TempleManagementPage/index.js";
import QuizManagement from "./pages/QuizManagement/index.js";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const audioRef = useRef(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token !== null) {
      const isExpired = IsTokenExpired(token);
      if (isExpired === true) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }

    socket.on("orderplace", async (data) => {
      console.log(data);
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          // Handle errors in case play fails
          console.error("Error playing audio:", error);
        });
      }
      // dispatch(handleAddOrder(data));
      // toast.success("You have new order");
    });
  }, [token]);

  return (
    <>
      <GlobalLoader />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/godMaster" element={<GodMaster />} />
          <Route path="/aarti" element={<AartiManagementPage />} />
          <Route path="/bhajan" element={<BhajanManagementPage />} />
          <Route path="/festival" element={<FestivalManagementPage />} />
          <Route path="/mantra" element={<MantraManagementPage />} />
          <Route path="/god" element={<GodManagementPage />} />
          <Route path="/sloka" element={<SlokManagementPage />} />
          <Route path="/ringtones" element={<RingtoneManagementPage />} />
          <Route path="/articles" element={<ArticleManagementPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/temple" element={<TempleManagementPage />} />
          <Route path="/quiz" element={<QuizManagement />} />


          {/* 
          <Route path="/user" element={<User />} />
          <Route path="/user/:page" element={<User />} />
          <Route path="/user/new" element={<NewUser />} />
          <Route path="/user/edit/:id" element={<NewUser />} />
          <Route path="/user/details/:id" element={<UserDetails />} /> */}

          {/*        
          <Route path="/payment" element={<Paymentsetting />} />
          <Route path="/payment/:page" element={<Paymentsetting />} />

          <Route path="/compliance" element={<ComplianceDate />} />
          <Route path="/compliance/:page" element={<ComplianceDate />} />
          <Route path="/compliance/new" element={<NewComplianceDate />} />
          <Route path="/compliance/edit/:id" element={<NewComplianceDate />} />

          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:page" element={<Teams />} />

          <Route path="/post" element={<Post />} />
          <Route path="/post/:page" element={<Post />} />
          <Route path="/post/new" element={<NewPost />} />
          <Route path="/post/edit/:id" element={<NewPost />} />

          <Route path="/event" element={<Event />} />
          <Route path="/event/:page" element={<Event />} />
          <Route path="/event/new" element={<NewEvent />} />
          <Route path="/event/edit/:id" element={<NewEvent />} />

          <Route path="/requsteduser" element={<RequstedUser />} />
          <Route path="/requsteduser/:page" element={<RequstedUser />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/payment-history/:page" element={<PaymentHistory />} />

          <Route path="/faq" element={<Faq />} />
          <Route path="/faq/:page" element={<Faq />} />
          <Route path="/faq/new" element={<NewFaq />} />
          <Route path="/faq/edit/:id" element={<NewFaq />} />

          <Route path="/support" element={<Support />} />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/payment-settings" element={<Paymentsetting />} />
          <Route path="/payment-settings/:page" element={<Paymentsetting />} />
          <Route path="/offer" element={<Offer />} />
          */}
        </Route>
        {/* <Route element={<PrivateRoute />}>
          <Route path="/teamsform" element={<TeamsForm />} />          
          </Route> */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Login />} />
        </Route>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/access" element={<TeamsForm />} />
        <Route path="/access/:userId" element={<TeamsForm />} />
      </Routes>
      <ToastContainer />
      <audio ref={audioRef} id="order-sound" src="/assets/sound/sound.mp3" />
    </>
  );
}

export default App;
