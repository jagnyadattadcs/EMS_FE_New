import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./shared/Navbar";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Home from "./components/Home";
import { Bounce, ToastContainer } from "react-toastify";
import Footer from "./shared/Footer";
import CEOContent from "./pages/user/CEOContent";
import {EmpCheckRoute} from './routes/EmpCheckRoute';
import Timesheet from "./pages/user/Timesheet";
import Attendance from "./pages/user/Attendance";

function App() {
  const { user } = useAuth();
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/CEOContent" element={<CEOContent />} />
        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
      <EmpCheckRoute element={<Footer />} />
    </>
  );
}

export default App;
