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
import ApplyLeave from "./pages/user/ApplyLeave";
import UpdateUser from "./pages/user/UpdateUser";
import HolidayList from "./pages/user/HolidayList";
import { AdminCheckRoute } from "./routes/AdminCheckRoute";
import AdminHome from "./pages/admin/AdminHome";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import AdminAttendance from "./pages/admin/AdminAttendance";
import RegisterUser from "./pages/admin/RegisterUser";
import LeaveApplication from "./pages/admin/LeaveApplication";
import AddHolidayForm from "./pages/admin/AddHolidayForm";
import ProjectList from "./pages/admin/ProjectList";
import AddProject from "./pages/admin/AddProject";
import DeletedEmployee from "./pages/admin/DeletedEmployee";

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
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={user ? user?.role === "admin" ? <Navigate to="/admin/home" /> : <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/CEOContent" element={<CEOContent />} />
        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/apply_leave" element={<ApplyLeave />} />
        <Route path="/update_user" element={<UpdateUser />} />
        <Route path="/holiday-list" element={<HolidayList />} />

        <Route element={<AdminCheckRoute />} >
          <Route path="/admin">
            <Route index element={<Navigate to="/admin/home" replace/>} />
            <Route path="home" element={<ProtectedRoutes element={<AdminHome />}/>} />
            <Route path="attendance" element={<ProtectedRoutes element={<AdminAttendance />} />}/>
            <Route path="register" element={<ProtectedRoutes element={<RegisterUser />} />}/>
            <Route path="leave_application" element={<ProtectedRoutes element={<LeaveApplication />} />}/>
            <Route path="holiday-list" element={<ProtectedRoutes element={<HolidayList />} />}/>
            <Route path="add-holiday" element={<ProtectedRoutes element={<AddHolidayForm />} />}/>
            <Route path="project-list" element={<ProtectedRoutes element={<ProjectList />} />}/>
            <Route path="add-project" element={<ProtectedRoutes element={<AddProject />} />}/>
            <Route path="deleted-emps" element={<ProtectedRoutes element={<DeletedEmployee />} />}/>
          </Route>
        </Route>
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={user.role === "admin" ? "/admin/home" : "/home"} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <EmpCheckRoute element={<Footer />} />
    </>
  );
}

export default App;
