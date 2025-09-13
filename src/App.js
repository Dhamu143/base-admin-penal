import { Fragment, useEffect,useRef } from "react";
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
import HubSetup from "./pages/hubsetup";
import HubRequested from "./pages/hubrequested";
import NewHub from "./pages/hubsetup/add";
import Language from "./pages/language";
import NativePlace from "./pages/nativeplace";
import Religion from "./pages/religion";
import NewLanguage from "./pages/language/add";
import NewNativePlace from "./pages/nativeplace/add";
import NewReligion from "./pages/religion/add"; 
import Caste from "./pages/caste";
import NewCaste from "./pages/caste/add"; 
import GlobalLoader from './components/GlobalLoader';
import HubDetails from "./pages/hubsetup/hubDetails";
import Faq from "./pages/faq";
import User from "./pages/users/index";
import NewUser from "./pages/users/add"; 
import Sanstha from "./pages/sanstha/index";
import NewSanstha from "./pages/sanstha/add";
import Sponsor from "./pages/sponsor/index";
import NewSponsor from "./pages/sponsor/add";
import NewFaq from "./pages/faq/add";
import SansthaDetails from "./pages/sanstha/sansthaDetails";
import Teams from "./pages/teams/index";
import TeamsForm from "./pages/teams/teamsform";
import UserDetails from "./pages/users/userDetails";
import Support from "./pages/support";
import Announcement from "./pages/announcement";
import Paymentsetting from "./pages/paymentsetting/index";
import Offer from "./pages/offer";
import ComplianceDate from "./pages/complianceDate/index";
import NewComplianceDate from "./pages/complianceDate/add";
import FacilityBooking from "./pages/FacilityBooking";
import Contribution from "./pages/Contribution";
import RequstedUser from "./pages/RequstedUser";
import PaymentHistory from "./pages/Payment-History";
import NewPost from "./pages/post/add";
import Post from "./pages/post";
import Projectcategory from "./pages/projectcategory";
import NewProjectcategory from "./pages/projectcategory/add";
import SocialProject from "./pages/socialproject";
import NewSocialProject from "./pages/socialproject/add";
import SocialProjectBooking from "./pages/SocialProjectBooking";
import NewEvent from "./pages/events/add";
import Event from "./pages/events";
import BoliBooking from "./pages/BoliBooking";

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
      console.log(data)
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

          <Route path="/community-setup" element={<HubSetup />} />
          <Route path="/community-setup/:page" element={<HubSetup />} />
           <Route path="/community-setup/new" element={<NewHub />} />
             <Route
            path="/community-setup/edit/:id"
            element={<NewHub />}
          />
          <Route path="/community-setup/details/:id" element={<HubDetails />} />

          <Route path="/caste" element={<Caste />} />
          <Route path="/caste/:page" element={<Caste />} />
          <Route path="/caste/new" element={<NewCaste />} />
          <Route path="/caste/edit/:id" element={<NewCaste />} />

          <Route path="/sanstha" element={<Sanstha />} />
          <Route path="/sanstha/:page" element={<Sanstha />} />
          <Route path="/sanstha/new" element={<NewSanstha />} />
          <Route path="/sanstha/edit/:id" element={<NewSanstha />} />
          <Route path="/sanstha/details/:id" element={<SansthaDetails />} />
          
          <Route path="/sponsor" element={<Sponsor />} />
          <Route path="/sponsor/:page" element={<Sponsor />} />
          <Route path="/sponsor/new" element={<NewSponsor />} />
          <Route path="/sponsor/edit/:id" element={<NewSponsor />} />
          <Route path="/sponsor/details/:id" element={<NewSponsor />} />

          <Route path="/user" element={<User />} />
          <Route path="/user/:page" element={<User />} />
          <Route path="/user/new" element={<NewUser />} />
          <Route path="/user/edit/:id" element={<NewUser />} />
          <Route path="/user/details/:id" element={<UserDetails />} />
          
          <Route path="/language" element={<Language />} />
          <Route path="/language/:page" element={<Language />} />
          <Route path="/language/new" element={<NewLanguage />} />
          <Route path="/language/edit/:id" element={<NewLanguage />} />
          <Route path="/native-place" element={<NativePlace />} />
          <Route path="/native-place/:page" element={<NativePlace />} />
          <Route path="/native-place/new" element={<NewNativePlace />} />
          <Route path="/native-place/edit/:id" element={<NewNativePlace />} />

          <Route path="/religion" element={<Religion />} />
          <Route path="/religion/:page" element={<Religion />} />
          <Route path="/religion/new" element={<NewReligion />} />
          <Route path="/religion/edit/:id" element={<NewReligion />} />
           <Route path="/hub-requested" element={<HubRequested />} />
          <Route path="/hub-requested/:page" element={<HubRequested />} />

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

          <Route path="/project-category" element={<Projectcategory />} />
          <Route path="/project-category/:page" element={<Projectcategory />} />
          <Route path="/project-category/new" element={<NewProjectcategory />} />
          <Route path="/project-category/edit/:id" element={<NewProjectcategory />} />
          
          <Route path="/event" element={<Event />} />
          <Route path="/event/:page" element={<Event />} />
          <Route path="/event/new" element={<NewEvent />} />
          <Route path="/event/edit/:id" element={<NewEvent />} />

           <Route path="/social-project" element={<SocialProject />} />
          <Route path="/social-project/:page" element={<SocialProject />} />
          <Route path="/social-project/new" element={<NewSocialProject />} />
          <Route path="/social-project/edit/:id" element={<NewSocialProject />} />

          <Route path="/facility-booking" element={<FacilityBooking />} />
          <Route path="/facility-booking/:page" element={<FacilityBooking />} />
          <Route path="/contribution" element={<Contribution />} />
          <Route path="/contribution/:page" element={<Contribution />} />
          <Route path="/requsteduser" element={<RequstedUser />} />
          <Route path="/requsteduser/:page" element={<RequstedUser />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/payment-history/:page" element={<PaymentHistory />} />
          <Route path="/socialproject-donation" element={<SocialProjectBooking />} />
          <Route path="/socialproject-donation/:page" element={<SocialProjectBooking />} />
            <Route path="/boli-booking" element={<BoliBooking />} />
          <Route path="/boli-booking/:page" element={<BoliBooking />} />

          <Route path="/faq" element={<Faq />} />
          <Route path="/faq/:page" element={<Faq />} />
          <Route path="/faq/new" element={<NewFaq />} />
          <Route path="/faq/edit/:id" element={<NewFaq />} />

          <Route path="/support" element={<Support />} />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/payment-settings" element={<Paymentsetting />} />
          <Route path="/payment-settings/:page" element={<Paymentsetting />} />
          <Route path="/offer" element={<Offer />} />

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
      <audio ref={audioRef} id="order-sound"  src="/assets/sound/sound.mp3" />
    </>
  );
}

export default App;
