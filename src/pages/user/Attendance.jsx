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
    FaUserClock,
    FaCalendarAlt,
    FaChartLine,
    FaClock,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';
import { MdOutlineTimer, MdOutlineDateRange } from 'react-icons/md';
import { BiTimeFive } from 'react-icons/bi';
import { BsArrowReturnLeft, BsArrowDown, BsArrowUp } from 'react-icons/bs';
import { HiOutlineChartBar } from 'react-icons/hi';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Attendance = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showHistory, setShowHistory] = useState(false);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [hoveredCard, setHoveredCard] = useState(null);
    
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

    const getAttendanceHistory = async (employeeId) => {
        try {
            setHistoryLoading(true);
            const response = await axios.get(`${BASE_URL}/api/attendance/history/${employeeId}?limit=30`);
            if (response.data.success) {
                setAttendanceHistory(response.data.data);
            }
            return response.data;
        } catch (error) {
            console.error("History fetch error:", error);
            toast.error("Failed to fetch attendance history");
            return [];
        } finally {
            setHistoryLoading(false);
        }
    };

    const getAttendanceStats = async (employeeId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/attendance/stats/${employeeId}`);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Stats fetch error:", error);
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
            fetchAttendanceHistory();
            fetchAttendanceStats();
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
            fetchAttendanceHistory();
            fetchAttendanceStats();
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

    const fetchAttendanceHistory = async () => {
        await getAttendanceHistory(employeeId);
    };

    const fetchAttendanceStats = async () => {
        await getAttendanceStats(employeeId);
    };

    useEffect(() => {
        fetchAttendance();
        fetchAttendanceHistory();
        fetchAttendanceStats();
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

    // Filter history by selected month/year
    const filteredHistory = attendanceHistory.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });

    // Calculate monthly statistics
    const monthlyStats = {
        totalDays: filteredHistory.length,
        presentDays: filteredHistory.filter(r => r.checkOut).length,
        totalHours: filteredHistory.reduce((acc, curr) => acc + (curr.workHours || 0), 0).toFixed(2),
        averageHours: filteredHistory.length > 0 
            ? (filteredHistory.reduce((acc, curr) => acc + (curr.workHours || 0), 0) / filteredHistory.length).toFixed(2)
            : 0
    };

    if (loading && !status) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-[#8BD005] mx-auto mb-4" />
                    <p className="text-gray-600">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-8 animate-fadeIn">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Attendance <span className="text-[#8BD005]">Dashboard</span>
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, <span className="font-semibold text-[#1B2749]">{employeeName}</span>
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div 
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        onMouseEnter={() => setHoveredCard('total')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Days</p>
                                <p className="text-2xl font-bold text-gray-800">{stats?.totalDays || 0}</p>
                            </div>
                            <FaCalendarAlt className={`text-3xl text-[#8BD005] transition-transform duration-300 ${hoveredCard === 'total' ? 'rotate-12' : ''}`} />
                        </div>
                    </div>

                    <div 
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        onMouseEnter={() => setHoveredCard('present')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Present Days</p>
                                <p className="text-2xl font-bold text-green-600">{stats?.presentDays || 0}</p>
                            </div>
                            <FaCheckCircle className={`text-3xl text-green-500 transition-transform duration-300 ${hoveredCard === 'present' ? 'rotate-12' : ''}`} />
                        </div>
                    </div>

                    <div 
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        onMouseEnter={() => setHoveredCard('hours')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Hours</p>
                                <p className="text-2xl font-bold text-gray-800">{stats?.totalHours?.toFixed(1) || 0}h</p>
                            </div>
                            <FaClock className={`text-3xl text-[#8BD005] transition-transform duration-300 ${hoveredCard === 'hours' ? 'rotate-12' : ''}`} />
                        </div>
                    </div>

                    <div 
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        onMouseEnter={() => setHoveredCard('avg')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Avg. Hours/Day</p>
                                <p className="text-2xl font-bold text-gray-800">{stats?.averageHours || 0}h</p>
                            </div>
                            <HiOutlineChartBar className={`text-3xl text-[#8BD005] transition-transform duration-300 ${hoveredCard === 'avg' ? 'rotate-12' : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Attendance Card - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2">
                        <div 
                            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            onMouseEnter={() => setHoveredCard('attendance')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Status Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <FaCalendarCheck className={`text-3xl text-[#8BD005] transition-transform duration-300 ${hoveredCard === 'attendance' ? 'rotate-12' : ''}`} />
                                <h2 className="text-2xl font-bold text-gray-800">Today's Attendance</h2>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-pulse">
                                    <FaExclamationTriangle className="text-red-500" />
                                    <p className="text-red-600">{error}</p>
                                </div>
                            )}

                            {status ? (
                                <div className="space-y-6">
                                    {/* Check In Info */}
                                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
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
                                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
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
                                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-blue-100 opacity-0 hover:opacity-20 transition-opacity"></div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
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
                                    <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] rounded-lg p-4 hover:from-[#2a3a5e] hover:to-[#1B2749] transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <MdOutlineTimer className={`text-[#8BD005] text-2xl transition-transform duration-300 ${hoveredCard === 'attendance' ? 'rotate-12' : ''}`} />
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
                                            className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            {loading ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                <>
                                                    <FaSignOutAlt className="group-hover:rotate-12 transition-transform" />
                                                    Check Out
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
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
                                        className="bg-linear-to-r from-[#8BD005] to-[#6d971a] hover:from-[#6d971a] hover:to-[#8BD005] text-white py-4 px-8 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl mx-auto disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <>
                                                <FaSignInAlt className="group-hover:rotate-12 transition-transform" />
                                                Check In Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - History */}
                    <div className="space-y-6">
                        {/* Month Selector */}
                        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <MdOutlineDateRange className="text-[#8BD005]" />
                                <h3 className="font-semibold text-gray-700">Select Month</h3>
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>
                                            {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                                <select 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                >
                                    {[2024, 2025, 2026].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Monthly Stats */}
                        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <HiOutlineChartBar className="text-[#8BD005]" />
                                Monthly Summary
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Present Days</span>
                                    <span className="font-bold text-green-600">{monthlyStats.presentDays}/{monthlyStats.totalDays}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Total Hours</span>
                                    <span className="font-bold text-[#1B2749]">{monthlyStats.totalHours}h</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Average/Day</span>
                                    <span className="font-bold text-[#8BD005]">{monthlyStats.averageHours}h</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent History Toggle */}
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-between group"
                        >
                            <span className="font-semibold text-gray-700 flex items-center gap-2">
                                <FaHistory className="text-[#8BD005] group-hover:rotate-12 transition-transform" />
                                Attendance History
                            </span>
                            {showHistory ? <BsArrowUp className="group-hover:-translate-y-1 transition-transform" /> : <BsArrowDown className="group-hover:translate-y-1 transition-transform" />}
                        </button>

                        {/* History Dropdown */}
                        {showHistory && (
                            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-fadeIn">
                                <h4 className="text-sm font-semibold text-gray-500 mb-3">Last 30 Days</h4>
                                {historyLoading ? (
                                    <div className="flex justify-center py-4">
                                        <FaSpinner className="animate-spin text-[#8BD005] text-2xl" />
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {attendanceHistory.length > 0 ? (
                                            attendanceHistory.map((record, index) => (
                                                <div 
                                                    key={index} 
                                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:translate-x-1 cursor-pointer border-b last:border-b-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {record.checkOut ? (
                                                            <FaCheckCircle className="text-green-500" size={14} />
                                                        ) : (
                                                            <FaTimesCircle className="text-red-500" size={14} />
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {new Date(record.date).toLocaleDateString('default', { 
                                                                    weekday: 'short',
                                                                    month: 'short', 
                                                                    day: 'numeric' 
                                                                })}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'} - 
                                                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'Active'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm font-semibold ${record.workHours >= 8 ? 'text-green-600' : 'text-orange-500'}`}>
                                                        {record.workHours?.toFixed(1)}h
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No attendance history available</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Motivational Quote */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 italic hover:text-gray-700 transition-colors">
                        "Your attendance is the first step towards success. Keep up the great work! 🌟"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
