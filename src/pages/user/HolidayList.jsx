import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { 
    FaEdit, 
    FaTrash, 
    FaCalendarAlt, 
    FaSpinner, 
    FaTimes,
    FaCheck,
    FaExclamationTriangle,
    FaSearch,
    FaFilter,
    FaDownload
} from "react-icons/fa";
import { MdDelete, MdEdit, MdEvent, MdClose } from "react-icons/md";
import { BsCalendarDate, BsCalendarMonth } from "react-icons/bs";

const HolidayList = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [deleteHoliday, setDeleteHoliday] = useState(false);
    const [index, setIndex] = useState(0);
    const [refresh, setRefresh] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMonth, setFilterMonth] = useState("all");
    const [editFormData, setEditFormData] = useState({
        name: "",
        date: "",
    });

    let loadingToast;
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const { errorHandleLogout } = useAuth();

    // Months for filter
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const fetchHolidays = async (year) => {
            try {
                setLoading(true);
                
                const res = await axios.get(
                    `${BASE_URL}/holiday/get_holidays?startDate=${year}-01-01&endDate=${year}-12-31`,
                    { headers: headers }
                );
                
                setHolidays(res.data.data);
                toast.success(res.data.message || "Holidays fetched successfully");
                setLoading(false);
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to fetch holidays");
                console.error("Error fetching holidays:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchHolidays(year);
        }
    }, [year, refresh, token]);

    const handleYearChange = (event) => {
        const newYear = parseInt(event.target.value, 10);
        setYear(newYear);
    };

    const formatDate = (dateString) => {
        const options = {
            day: "numeric",
            month: "long",
            year: "numeric",
            weekday: "long",
        };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const isCurrentMonth = (dateString) => {
        const currentDate = new Date();
        const holidayDate = new Date(dateString);
        return currentDate.getMonth() === holidayDate.getMonth() && 
               currentDate.getFullYear() === holidayDate.getFullYear();
    };

    const handleEditAction = (index) => {
        const selectedHoliday = holidays[index];
        setEditingHoliday(selectedHoliday);
        setEditFormData({
            name: selectedHoliday.name,
            date: selectedHoliday.dte ? selectedHoliday.dte.split('T')[0] : "",
        });
    };

    const handleDeleteModel = async () => {
        try {
            const deleteToast = toast.loading("Deleting holiday...");
            
            const res = await axios.delete(
                `${BASE_URL}/holiday/delete_holiday?holidayId=${holidays[index]._id}`,
                { headers: headers }
            );
            
            toast.update(deleteToast, {
                render: res.data.message || "Holiday deleted successfully",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
            
            setRefresh(refresh + 1);
            setDeleteHoliday(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete holiday");
            console.error("Error deleting holiday:", err);
        }
    };

    const handleDeleteAction = (index) => {
        setIndex(index);
        setDeleteHoliday(true);
    };

    const handleCloseModal = () => {
        setEditingHoliday(null);
        setEditFormData({
            name: "",
            date: "",
        });
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setEditFormData({
            ...editFormData,
            [name]: value,
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        const { name, date } = editFormData;
        const holidayId = editingHoliday._id;

        try {
            const updateToast = toast.loading("Updating holiday...");
            
            const response = await axios.post(
                `${BASE_URL}/holiday/update_holiday?holidayId=${holidayId}`,
                { name, date },
                { headers: headers }
            );

            toast.update(updateToast, {
                render: response.data.message || "Holiday updated successfully",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            setHolidays((prevHolidays) => {
                return prevHolidays.map((holiday) =>
                    holiday._id === holidayId
                        ? { ...holiday, name: editFormData.name, dte: editFormData.date }
                        : holiday
                );
            });

            setEditingHoliday(null);
            setEditFormData({ name: "", date: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating holiday");
            console.error("Error updating holiday:", error);
        }
    };

    // Filter holidays based on search and month
    const filteredHolidays = holidays.filter(holiday => {
        const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase());
        const holidayMonth = new Date(holiday.dte).getMonth();
        const matchesMonth = filterMonth === "all" || holidayMonth === parseInt(filterMonth);
        return matchesSearch && matchesMonth;
    });

    // Group holidays by month for better organization
    const groupedHolidays = filteredHolidays.reduce((acc, holiday) => {
        const month = new Date(holiday.dte).getMonth();
        if (!acc[month]) acc[month] = [];
        acc[month].push(holiday);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-[#8BD005] mx-auto mb-4" />
                    <p className="text-gray-600">Loading holidays...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                                Holiday <span className="text-[#8BD005]">List</span>
                            </h1>
                            <p className="text-gray-600 mt-2">View and manage company holidays</p>
                        </div>
                        
                        {/* Year Selector */}
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
                            <BsCalendarDate className="text-[#8BD005]" />
                            <input
                                type="number"
                                value={year}
                                onChange={handleYearChange}
                                min="2020"
                                max="2030"
                                className="w-24 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-[#8BD005] focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search holidays..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-3 text-gray-400" />
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent outline-none appearance-none bg-white"
                            >
                                <option value="all">All Months</option>
                                {months.map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-500">Total Holidays</p>
                            <p className="text-2xl font-bold text-[#1B2749]">{holidays.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-500">This Month</p>
                            <p className="text-2xl font-bold text-[#1B2749]">
                                {holidays.filter(h => isCurrentMonth(h.dte)).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-500">Filtered</p>
                            <p className="text-2xl font-bold text-[#1B2749]">{filteredHolidays.length}</p>
                        </div>
                    </div>
                </div>

                {/* Holiday List */}
                {filteredHolidays.length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
                            <div key={month} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                                {/* Month Header */}
                                <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] px-6 py-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <BsCalendarMonth />
                                        {months[parseInt(month)]} {year}
                                        <span className="ml-2 text-sm bg-[#8BD005] text-white px-2 py-1 rounded-full">
                                            {monthHolidays.length} holidays
                                        </span>
                                    </h2>
                                </div>

                                {/* Holiday Cards */}
                                <div className="divide-y divide-gray-100">
                                    {monthHolidays.map((holiday, idx) => {
                                        const actualIndex = holidays.findIndex(h => h._id === holiday._id);
                                        return (
                                            <div
                                                key={holiday._id}
                                                className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                                                    isCurrentMonth(holiday.dte) ? 'bg-green-50' : ''
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                            {holiday.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                                                            <FaCalendarAlt className="text-[#8BD005]" />
                                                            <span>{formatDate(holiday.dte)}</span>
                                                        </div>
                                                    </div>

                                                    {role === "admin" && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditAction(actualIndex)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit Holiday"
                                                            >
                                                                <FaEdit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAction(actualIndex)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Holiday"
                                                            >
                                                                <FaTrash size={18} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {isCurrentMonth(holiday.dte) && (
                                                    <div className="mt-3">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            <FaCheck size={10} />
                                                            Current Month
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCalendarAlt className="text-gray-400 text-3xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Holidays Found</h3>
                        <p className="text-gray-500">
                            {searchTerm || filterMonth !== "all" 
                                ? "Try adjusting your search or filter criteria"
                                : "No holidays available for the selected year"}
                        </p>
                    </div>
                )}

                {/* Edit Modal */}
                {editingHoliday && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-slideIn">
                            <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] px-6 py-4 rounded-t-xl flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <MdEdit />
                                    Edit Holiday
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Holiday Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Holiday Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={editFormData.date}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-[#8BD005] hover:bg-[#6d971a] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaCheck size={16} />
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteHoliday && holidays[index] && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-slideIn">
                            <div className="bg-linear-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-xl">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FaExclamationTriangle />
                                    Confirm Delete
                                </h2>
                            </div>

                            <div className="p-6">
                                <p className="text-gray-700 mb-2">
                                    Are you sure you want to delete this holiday?
                                </p>
                                <p className="font-semibold text-[#1B2749] mb-6">
                                    {holidays[index].name} - {formatDate(holidays[index].dte)}
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteModel}
                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaTrash size={16} />
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setDeleteHoliday(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add animation styles */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default HolidayList;