import { Fragment, useEffect, useRef } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
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
// import { SocketContext } from "./context/socket";
import ErrorBoundary from "./common/ErrorBoundary"; 
import GlobalLoader from "./components/GlobalLoader";


function App() {
  const navigate = useNavigate();
  // const socket = useContext(SocketContext);
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

    // socket.on("orderplace", async (data) => {
    //   console.log(data);
    //   if (audioRef.current) {
    //     audioRef.current.play().catch((error) => {
    //       // Handle errors in case play fails
    //       console.error("Error playing audio:", error);
    //     });
    //   }
    //   // dispatch(handleAddOrder(data));
    //   // toast.success("You have new order");
    // });
  }, [token, navigate]);

  return (
    <>
      <ErrorBoundary>
        <GlobalLoader />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
              
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
