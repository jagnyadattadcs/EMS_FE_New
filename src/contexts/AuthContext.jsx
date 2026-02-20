import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    // Configure axios defaults
    axios.defaults.baseURL = BASE_URL;

    // Add token to axios headers if it exists
    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Check if user is already logged in (on mount)
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
            setUser(true);
        }
        setLoading(false);
    }, []);

    const login = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${BASE_URL}/users/login`, data);
            
            if (res.data.success) {
                const { token } = res.data.data;

                const role  = res.data.role;
                const userId = res.data.userId;
                
                // Store in localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("userId", userId);
                localStorage.setItem("role", role);
                
                // Set auth token for future requests
                setAuthToken(token);
                
                // Update user state
                setUser({ userId, role });
                
                // Show success message
                toast.success(res.data.message || "Login Successful!");
                
                // Navigate based on role
                if (role === "emp") {
                    navigate("/home");
                } else if (role === "admin") {
                    navigate("/admin/home");
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to logout?");
        
        if (!confirmLogout) return;
        
        setLoading(true);
        try {
            const userId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");

            // Using axios for logout
            const res = await axios.post(
                `${BASE_URL}/users/logout`,
                { userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                // Clear auth token from axios defaults
                setAuthToken(null);
                
                // Clear localStorage
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");
                
                // Clear user state
                setUser(null);
                
                // Show success message
                toast.success(res.data.message || "Logged out successfully");
                
                // Navigate to login page
                navigate("/login");
            } else {
                toast.error(res.data.message || "Logout failed");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error during logout";
            toast.error(errorMessage);
            console.error("Logout error:", error);
            
            // Optional: Even if API fails, clear local data
            // Uncomment below if you want to force logout on error
            setAuthToken(null);
            localStorage.clear();
            setUser(null);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const errorHandleLogout = () => {
        toast.success("LogOut Successfully")
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("adminSetUser");
        setUser(null);
        navigate("/");
    };

    // Helper function to get current user data
    const getCurrentUser = () => {
        return {
            userId: localStorage.getItem("userId"),
            role: localStorage.getItem("role"),
            isAuthenticated: !!localStorage.getItem("token"),
        };
    };

    const value = {
        user,
        setUser,
        loading,
        error,
        login,
        logout,
        getCurrentUser,
        errorHandleLogout,
        isAuthenticated: !!localStorage.getItem("token"),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};