import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { 
    FaSignInAlt, 
    FaSignOutAlt,
    FaHistory,
    FaSpinner,
    FaExclamationTriangle,
    FaCalendarCheck,
    FaUserClock
} from 'react-icons/fa';
import { MdOutlineTimer } from 'react-icons/md';
import { BiTimeFive } from 'react-icons/bi';
import { BsArrowReturnLeft } from 'react-icons/bs';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Attendance = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const employeeId = localStorage.getItem('userId');
    const employeeName = localStorage.getItem('name') || 'Employee';

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getTodayAttendance = async (employeeId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/attendance/status/${employeeId}`);
            return response.data;
        } catch (error) {
            console.error("Attendance fetch error:", error);
            return null;
        }
    };

    const checkIn = async (employeeId) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/attendance/check-in`, { employeeId });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Error during check-in" };
        }
    };

    const checkOut = async (employeeId) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/attendance/check-out`, { employeeId });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Error during check-out" };
        }
    };

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            const response = await checkIn(employeeId);
            setStatus(response.data);
            toast.success("Check-in successful! Have a great day! 🎉");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setLoading(true);
            const response = await checkOut(employeeId);
            setStatus(response.data);
            toast.success("Check-out successful! See you tomorrow! 👋");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const data = await getTodayAttendance(employeeId);
            
            if (!data) {
                setStatus(null);
            } else {
                setStatus(data);
            }
            setError("");
    
        } catch (err) {
            console.error("Error fetching attendance:", err);
            setError(err.message || "Could not fetch attendance");
            toast.error(err.message || "Could not fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    // Calculate work hours if checked in
    const calculateCurrentWorkHours = () => {
        if (status?.checkIn && !status?.checkOut) {
            const checkInTime = new Date(status.checkIn).getTime();
            const now = currentTime.getTime();
            const hours = ((now - checkInTime) / (1000 * 60 * 60)).toFixed(2);
            return hours;
        }
        return status?.workHours || 0;
    };

    if (loading && !status) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-[#8BD005] mx-auto mb-4" />
                    <p className="text-gray-600">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-8 animate-fadeIn">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Attendance <span className="text-[#8BD005]">Dashboard</span>
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, <span className="font-semibold text-[#1B2749]">{employeeName}</span>
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6"> 
                    {/* Attendance Card - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-slideIn animation-delay-200">
                            
                            {/* Status Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <FaCalendarCheck className="text-3xl text-[#8BD005]" />
                                <h2 className="text-2xl font-bold text-gray-800">Today's Attendance</h2>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                                    <FaExclamationTriangle className="text-red-500" />
                                    <p className="text-red-600">{error}</p>
                                </div>
                            )}

                            {status ? (
                                <div className="space-y-6">
                                    {/* Check In Info */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <FaSignInAlt className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Check In Time</p>
                                                <p className="text-xl font-semibold text-gray-800">
                                                    {new Date(status.checkIn).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Check Out Info or Active Session */}
                                    {status.checkOut ? (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                    <FaSignOutAlt className="text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Check Out Time</p>
                                                    <p className="text-xl font-semibold text-gray-800">
                                                        {new Date(status.checkOut).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 animate-pulse">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <BiTimeFive className="text-blue-600 text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-blue-600 font-medium">Active Session</p>
                                                    <p className="text-2xl font-bold text-blue-700">
                                                        {calculateCurrentWorkHours()} hours
                                                    </p>
                                                    <p className="text-xs text-blue-500 mt-1">
                                                        Working since {new Date(status.checkIn).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Work Hours */}
                                    <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <MdOutlineTimer className="text-[#8BD005] text-2xl" />
                                                <span className="text-white">Total Hours Worked</span>
                                            </div>
                                            <span className="text-2xl font-bold text-[#8BD005]">
                                                {status.workHours || calculateCurrentWorkHours()}h
                                            </span>
                                        </div>
                                    </div>

                                    {/* Check Out Button (if not checked out) */}
                                    {!status.checkOut && (
                                        <button
                                            onClick={handleCheckOut}
                                            disabled={loading}
                                            className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-101 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                <>
                                                    <FaSignOutAlt />
                                                    Check Out
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                        <FaUserClock className="text-gray-400 text-4xl" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        No Check-in Record
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        You haven't checked in today. Start your work day now!
                                    </p>
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={loading}
                                        className="bg-linear-to-r from-[#8BD005] to-[#6d971a] hover:from-[#6d971a] hover:to-[#8BD005] text-white py-4 px-8 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <>
                                                <FaSignInAlt />
                                                Check In Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Motivational Quote */}
                <div className="mt-8 text-center animate-fadeIn animation-delay-600">
                    <p className="text-gray-500 italic">
                        "Your attendance is the first step towards success. Keep up the great work! 🌟"
                    </p>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }

                .animate-slideIn {
                    animation: slideIn 0.6s ease-out forwards;
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                }

                .animation-delay-600 {
                    animation-delay: 0.6s;
                }
            `}</style>
        </div>
    );
};

export default Attendance;