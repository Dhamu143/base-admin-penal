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

import GlobalLoader from "./components/GlobalLoader";

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
import AartiFormPage from "./pages/AartiManagementPage/AartiFormPage.js";
import FestivalFormPage from "./pages/FestivalManagementPage/FestivalFormPage.js";
import MantraFormPage from "./pages/MantraManagementPage/MantraFormPage.js";
import BhajanFormPage from "./pages/Bhajan/BhajanFormPage.js";
import SlokFormPage from "./pages/SlokManagementPage/SlokFormPage.js";
import ArticleFormPage from "./pages/ArticleManagementPage/ArticleFormPage.js";
import TempleFormPage from "./pages/TempleManagementPage/TempleFormPage.js";
import QuizFormPage from "./pages/QuizManagement/QuizFormPage.js";
import NewsFormPage from "./pages/NewsManagementPage/NewsManagementForm.js";
import NewsManagementPage from "./pages/NewsManagementPage/index.js";
import StoryManagementPage from "./pages/StoryManagementPage/index.js";
import StoryFormPage from "./pages/StoryManagementPage/StoryFormPage.js";
import StutiManagementPage from "./pages/StutiManagementPage/index.js";
import StutiFormPage from "./pages/StutiManagementPage/StutiFormPage.js";
import GodFormPage from "./pages/GodManagementPage/GodFormModal.js";
import RingtoneFormPage from "./pages/RingtoneManagementPage/RingtoneForm.js";
import ErrorBoundary from "./common/ErrorBoundary.js";
import DailyLogListPage from "./pages/DailyLog/index.js";
import DailyLogFormPage from "./pages/DailyLog/DailyLogFormPage.js";
import Post from "./pages/Post/index.js";
import CreatePostPage from "./pages/Post/CreatePostPage.js";
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
      <ErrorBoundary>
        <GlobalLoader />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/dailylog" element={<DailyLogListPage />} />
            <Route path="/dailylog/new" element={<DailyLogFormPage />} />
            <Route path="/dailylog/edit/:id" element={<DailyLogFormPage />} />

            <Route path="/aarti" element={<AartiManagementPage />} />
            <Route path="/aartis/new" element={<AartiFormPage />} />
            <Route path="/aartis/edit/:id" element={<AartiFormPage />} />
            <Route path="/bhajan" element={<BhajanManagementPage />} />
            <Route path="/bhajans/new" element={<BhajanFormPage />} />
            <Route path="/bhajans/edit/:id" element={<BhajanFormPage />} />
            <Route path="/festival" element={<FestivalManagementPage />} />
            <Route path="/festivals/new" element={<FestivalFormPage />} />
            <Route path="/festivals/edit/:id" element={<FestivalFormPage />} />
            <Route path="/mantra" element={<MantraManagementPage />} />
            <Route path="/mantras/new" element={<MantraFormPage />} />
            <Route path="/mantras/edit/:id" element={<MantraFormPage />} />

            <Route path="/godMaster" element={<GodMaster />} />

            <Route path="/god" element={<GodManagementPage />} />
            <Route path="/god-form" element={<GodFormPage />} />
            <Route path="/god-form/:id" element={<GodFormPage />} />

            <Route path="/sloka" element={<SlokManagementPage />} />
            <Route path="/sloks/new" element={<SlokFormPage />} />
            <Route path="/sloks/edit/:id" element={<SlokFormPage />} />
            <Route path="/ringtones" element={<RingtoneManagementPage />} />
            <Route path="/ringtones/new" element={<RingtoneFormPage />} />
            <Route path="/ringtones/edit/:id" element={<RingtoneFormPage />} />

            <Route path="/articles" element={<ArticleManagementPage />} />
            <Route path="/articles/new" element={<ArticleFormPage />} />
            <Route path="/articles/edit/:id" element={<ArticleFormPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/temple" element={<TempleManagementPage />} />
            <Route path="/temples/new" element={<TempleFormPage />} />
            <Route path="/temples/edit/:id" element={<TempleFormPage />} />

            <Route path="/news" element={<NewsManagementPage />} />
            <Route path="/news/new" element={<NewsFormPage />} />
            <Route path="/news/:id/edit" element={<NewsFormPage />} />

            <Route path="/story" element={<StoryManagementPage />} />
            <Route path="/story/new" element={<StoryFormPage />} />
            <Route path="/story/:id/edit" element={<StoryFormPage />} />

            <Route path="/stuti" element={<StutiManagementPage />} />
            <Route path="/stuti/new" element={<StutiFormPage />} />
            <Route path="/stuti/:id/edit" element={<StutiFormPage />} />

            <Route path="/quiz" element={<QuizManagement />} />
            <Route path="/quizzes/new" element={<QuizFormPage />} />
            <Route path="/quizzes/edit/:id" element={<QuizFormPage />} />

            <Route path="/post" element={<Post />} />
            <Route path="/post/create" element={<CreatePostPage />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Login />} />
          </Route>
          <Route path="/signup" element={<SignUp />} />
        </Routes>
        <ToastContainer />
        <audio ref={audioRef} id="order-sound" src="/assets/sound/sound.mp3" />
      </ErrorBoundary>
    </>
  );
}

export default App;
