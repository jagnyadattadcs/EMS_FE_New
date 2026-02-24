import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const AdminCheckRoute = () => {
  const { user } = useAuth();
  const userRole = localStorage.getItem('role');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};