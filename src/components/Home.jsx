import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState("");
    
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const navigate = useNavigate();
    const { errorHandleLogout, setUser } = useAuth();

    const effectRan = useRef(false);

    useEffect(() => {
        if (!token || !userId) {
            navigate('/login');
            return;
        }

        // Prevent double execution in development
        if (effectRan.current === false) {
            const fetchUserProfile = async () => {
                try {
                    setIsLoading(true);
                    const res = await axios.get(`${BASE_URL}/users/profile?userId=${userId}`, {
                        headers: headers,
                    });
                    
                    if (res.data?.user) {
                        localStorage.setItem('dp', res.data.user.dp || '');
                        localStorage.setItem('name', res.data.user.name || '');
                        setUser(res.data?.user);
                        setUserName(res.data.user.name || 'User');
                    }
                } catch (err) {
                    if (err.response?.status === 401) {
                        toast.error("Session expired. Please login again.");
                        errorHandleLogout();
                    } else {
                        toast.error("Unable to fetch data!");
                    }
                    console.error("Error fetching profile:", err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserProfile();
            
            return () => {
                effectRan.current = true;
            };
        }
    }, [token, userId, navigate, BASE_URL, errorHandleLogout]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8BD005] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-gray-900/[0.02] -z-10" />
                
                {/* Gradient Orbs */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
                
                {/* Hero Content */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center">
                        {/* Welcome Badge */}
                        <div className="inline-flex items-center gap-2 bg-[#8BD005]/10 text-[#8BD005] px-4 py-2 rounded-full mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8BD005] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8BD005]"></span>
                            </span>
                            <span className="text-sm font-medium">Welcome back, {userName}!</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Employee Management
                            <span className="block text-[#8BD005] mt-2">System</span>
                        </h1>

                        {/* Description */}
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Streamline your workforce management with our comprehensive EMS solution. 
                            Track attendance, manage leaves, and boost productivity all in one place.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="group relative px-8 py-4 bg-[#8BD005] text-white font-semibold rounded-xl hover:bg-[#7bb504] transition-all duration-300 transform hover:scale-105 hover:shadow-xl w-full sm:w-auto"
                            >
                                Go to Dashboard
                                <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={() => navigate('/profile')}
                                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-[#8BD005] hover:text-[#8BD005] transition-all duration-300 w-full sm:w-auto"
                            >
                                View Profile
                            </button>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-[#8BD005]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-[#8BD005]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">150+</div>
                                <div className="text-gray-600">Active Employees</div>
                            </div>

                            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-[#8BD005]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-[#8BD005]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">98%</div>
                                <div className="text-gray-600">Attendance Rate</div>
                            </div>

                            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-[#8BD005]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-[#8BD005]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">4.8/5</div>
                                <div className="text-gray-600">Employee Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to manage your team</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Powerful features to help you manage your workforce efficiently and effectively.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-[#8BD005]/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#8BD005]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendance Tracking</h3>
                        <p className="text-gray-600">Easily track employee attendance, work hours, and overtime with our intuitive system.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-[#8BD005]/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#8BD005]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Leave Management</h3>
                        <p className="text-gray-600">Streamlined leave requests and approvals with automated tracking and balance updates.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-[#8BD005]/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#8BD005]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Reports</h3>
                        <p className="text-gray-600">Generate detailed reports and analytics to track team performance and productivity.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;