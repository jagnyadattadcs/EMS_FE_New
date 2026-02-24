import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { 
    FaCalendarAlt, 
    FaSpinner, 
    FaExclamationCircle,
    FaUserCheck,
    FaUserClock,
    FaClock,
    FaIdCard,
    FaBriefcase,
    FaUserTie,
    FaSearch,
    FaFilter,
    FaDownload,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";
import { BsCheckCircle, BsXCircle, BsClockHistory } from "react-icons/bs";
import { MdOutlineWork, MdOutlineAccessTime } from "react-icons/md";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AdminAttendance = () => {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        averageHours: 0
    });

    useEffect(() => {
        fetchAttendance(date);
    }, [date]);

    // Calculate stats whenever attendance changes
    useEffect(() => {
        if (attendance.length > 0) {
            const present = attendance.filter(record => record.checkIn).length;
            const totalHours = attendance.reduce((sum, record) => sum + (record.workHours || 0), 0);
            
            setStats({
                total: attendance.length,
                present: present,
                absent: attendance.length - present,
                averageHours: attendance.length > 0 ? (totalHours / attendance.length).toFixed(1) : 0
            });
        } else {
            setStats({
                total: 0,
                present: 0,
                absent: 0,
                averageHours: 0
            });
        }
    }, [attendance]);

    const fetchAttendance = async (selectedDate) => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`${BASE_URL}/api/attendance/all/${selectedDate}`);
            setAttendance(response.data);
        } catch (err) {
            setError("Error fetching attendance data");
            toast.error("Failed to fetch attendance data");
            console.error("Error fetching attendance:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "Not Checked In";
        try {
            return format(parseISO(timestamp), "hh:mm a");
        } catch {
            return "Invalid Time";
        }
    };

    const handlePreviousDay = () => {
        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() - 1);
        setDate(format(prevDate, "yyyy-MM-dd"));
    };

    const handleNextDay = () => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        setDate(format(nextDate, "yyyy-MM-dd"));
    };

    const handleToday = () => {
        setDate(format(new Date(), "yyyy-MM-dd"));
    };

    // Filter and sort attendance
    const filteredAndSortedAttendance = attendance
        .filter(record => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                record.employeeId?.name?.toLowerCase().includes(searchLower) ||
                record.employeeId?.empId?.toLowerCase().includes(searchLower) ||
                record.employeeId?.designation?.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case "name":
                    aValue = a.employeeId?.name || "";
                    bValue = b.employeeId?.name || "";
                    break;
                case "empId":
                    aValue = a.employeeId?.empId || "";
                    bValue = b.employeeId?.empId || "";
                    break;
                case "checkIn":
                    aValue = a.checkIn || "";
                    bValue = b.checkIn || "";
                    break;
                case "workHours":
                    aValue = a.workHours || 0;
                    bValue = b.workHours || 0;
                    break;
                default:
                    aValue = a.employeeId?.name || "";
                    bValue = b.employeeId?.name || "";
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return null;
        return sortOrder === "asc" ? "↑" : "↓";
    };

    const handleExport = () => {
        // Create CSV content
        const headers = ["Employee ID", "Name", "Designation", "Check-In", "Check-Out", "Work Hours"];
        const csvContent = [
            headers.join(","),
            ...filteredAndSortedAttendance.map(record => 
                [
                    record.employeeId?.empId || "N/A",
                    record.employeeId?.name || "N/A",
                    record.employeeId?.designation || "N/A",
                    record.checkIn ? formatTime(record.checkIn) : "Not Checked In",
                    record.checkOut ? formatTime(record.checkOut) : "Not Checked Out",
                    record.workHours ? `${record.workHours} hrs` : "N/A"
                ].join(",")
            )
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${date}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success("Attendance data exported successfully");
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Admin <span className="text-[#8BD005]">Attendance</span> Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">View and manage employee attendance records</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Employees</p>
                                <p className="text-2xl font-bold text-[#1B2749]">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaUserTie className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Present</p>
                                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <BsCheckCircle className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Absent</p>
                                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <BsXCircle className="text-red-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Avg. Hours</p>
                                <p className="text-2xl font-bold text-[#8BD005]">{stats.averageHours}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BsClockHistory className="text-purple-600 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Date Selector */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousDay}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaChevronLeft className="text-gray-600" />
                            </button>
                            
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleNextDay}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaChevronRight className="text-gray-600" />
                            </button>

                            <button
                                onClick={handleToday}
                                className="px-4 py-2 bg-[#8BD005] text-white rounded-lg hover:bg-[#6d971a] transition-colors ml-2"
                            >
                                Today
                            </button>
                        </div>

                        {/* Search and Export */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, ID, designation..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleExport}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1B2749] text-white rounded-lg hover:bg-[#2a3a5e] transition-colors"
                            >
                                <FaDownload size={16} />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <FaSpinner className="animate-spin text-4xl text-[#8BD005] mx-auto mb-4" />
                        <p className="text-gray-600">Loading attendance data...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaExclamationCircle className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={() => fetchAttendance(date)}
                            className="mt-4 px-6 py-2 bg-[#8BD005] text-white rounded-lg hover:bg-[#6d971a] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Attendance Table */}
                {!loading && !error && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e]">
                                    <tr>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                                            onClick={() => handleSort("empId")}
                                        >
                                            <div className="flex items-center gap-2">
                                                <FaIdCard />
                                                Employee ID {getSortIcon("empId")}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                                            onClick={() => handleSort("name")}
                                        >
                                            <div className="flex items-center gap-2">
                                                <FaUserTie />
                                                Name {getSortIcon("name")}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                                            <div className="flex items-center gap-2">
                                                <FaBriefcase />
                                                Designation
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                                            onClick={() => handleSort("checkIn")}
                                        >
                                            <div className="flex items-center gap-2">
                                                <FaUserCheck />
                                                Check-In {getSortIcon("checkIn")}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                                            <div className="flex items-center gap-2">
                                                <FaUserClock />
                                                Check-Out
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                                            onClick={() => handleSort("workHours")}
                                        >
                                            <div className="flex items-center gap-2">
                                                <MdOutlineAccessTime />
                                                Work Hours {getSortIcon("workHours")}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAndSortedAttendance.length > 0 ? (
                                        filteredAndSortedAttendance.map((record) => (
                                            <tr 
                                                key={record._id} 
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {record.employeeId?.empId || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {record.employeeId?.name || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {record.employeeId?.designation || "N/A"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {record.checkIn ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            <FaClock size={10} />
                                                            {formatTime(record.checkIn)}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                            <BsXCircle size={10} />
                                                            Not Checked In
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {record.checkOut ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                            <FaClock size={10} />
                                                            {formatTime(record.checkOut)}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                            <BsXCircle size={10} />
                                                            Not Checked Out
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {record.workHours ? (
                                                        <span className="font-semibold text-[#8BD005]">
                                                            {record.workHours} hrs
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <FaExclamationCircle className="text-3xl text-gray-400 mb-2" />
                                                    <p>No attendance records found for this date.</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Try selecting a different date
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer with Summary */}
                        {filteredAndSortedAttendance.length > 0 && (
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                                    <p>
                                        Showing <span className="font-semibold">{filteredAndSortedAttendance.length}</span> of <span className="font-semibold">{attendance.length}</span> records
                                    </p>
                                    <p className="flex items-center gap-4 mt-2 sm:mt-0">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Present: {stats.present}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            Absent: {stats.absent}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttendance;