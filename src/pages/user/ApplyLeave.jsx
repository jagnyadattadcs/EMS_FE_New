import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { FaTrash, FaUpload, FaPhone, FaCalendarAlt, FaFileAlt, FaInfoCircle } from "react-icons/fa";
import { MdDelete, MdDescription, MdAttachFile } from "react-icons/md";
import { BsCalendarDate, BsClockHistory } from "react-icons/bs";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ApplyLeave = () => {
    const navigate = useNavigate();
    const [holiday, setHoliday] = useState([]);
    const [refresh, setRefresh] = useState(0);
    let loadingToast;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    
    useEffect(() => {
        if (token && role !== "emp") {
            navigate("/admin/home");
        }
    }, [token, role, navigate]);

    const [selectedData, setSelectedData] = useState(new Date());
    const [data, setData] = useState({
        contact_number: "",
        startingDate: "",
        ending_date: "",
        noOfDays: "",
        reason: "",
        file: null,
        type: "",
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0]; // Get the first file selected by the user
        setData((prevData) => ({
            ...prevData,
            file: file,
        }));
    };

    const [arrayData, setArrayData] = useState([]);
    const { errorHandleLogout } = useAuth();
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const handelCalender = (date) => {
        setSelectedData(date);
    };

    const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Adjusting the end date to include the full day
        end.setDate(end.getDate() + 1);

        let daysWithoutSundays = 0;

        while (start < end) {
            // Checking if the current day is not a Sunday (0 index in JavaScript Date object)
            if (start.getDay() !== 0) {
                daysWithoutSundays++;
            }

            // Moving to the next day
            start.setDate(start.getDate() + 1);
        }
        return daysWithoutSundays;
    };

    const formatDate = (inputDate) => {
        // Check if inputDate is a valid date
        if (!inputDate || isNaN(new Date(inputDate))) {
            return "Invalid Date";
        }

        const date = new Date(inputDate);
        const option = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Intl.DateTimeFormat("en-GB", option).format(date);
    };

    const handleStartingDateChange = (e) => {
        const startingDate = e.target.value;
        const endingDate = data.ending_date;
        const noOfDays = calculateDays(startingDate, endingDate);
        setData({ ...data, startingDate, noOfDays });
    };

    // Event handler for ending date change
    const handleEndingDateChange = (e) => {
        const endingDate = e.target.value;
        const startingDate = data.startingDate;
        const noOfDays = calculateDays(startingDate, endingDate);
        setData({ ...data, ending_date: endingDate, noOfDays });
    };

    const handelDelete = async (value) => {
        const conFirmDelete = window.confirm("Are you sure you want to delete");
        if (conFirmDelete) {
            try {
                await axios
                    .delete(
                        `${BASE_URL}/users/leave/delete_leave?leaveId=${arrayData[value]._id}`,
                        { headers: headers }
                    )
                    .then((res) => {
                        toast.success(res.data.message);
                        setRefresh(refresh + 1);
                    })
                    .catch((err) => {
                        toast.error(`${err.response?.data?.message || "Error deleting leave"}`);
                    });
            } catch {
                toast.error("Something went wrong, Try logging in again");
                errorHandleLogout();
            }
        }
    };

    useEffect(() => {
        try {
            const fetchData = async () => {
                await axios
                    .get(
                        `${BASE_URL}/users/leave/view_particular_leaves?status=all&userId=${userId}`,
                        { headers: headers }
                    )
                    .then((res) => {
                        setArrayData(res.data.data);
                    })
                    .catch((err) => {
                        toast.error(`${err.response?.data?.message || "Error fetching leaves"}`);
                    });
            };
            if (userId) {
                fetchData();
            }
        } catch {
            toast.error("Something went wrong, Try logging in again");
            errorHandleLogout();
        }
    }, [refresh, userId]);

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    useEffect(() => {
        try {
            axios
                .get(
                    `${BASE_URL}/holiday/get_holidays?startDate=${year}-01-01&endDate=${year}-12-31`,
                    { headers: headers }
                )
                .then((res) => {
                    setHoliday(res.data.data);
                })
                .catch((err) => {
                    // Silent fail for holidays
                });
        } catch (err) {
            // Silent fail
        }
    }, []);

    const handelSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append("startDate", data.startingDate);
        formData.append("endDate", data.ending_date);
        formData.append("reason", data.reason);
        if (data.file) {
            formData.append("supportiveDocument", data.file);
        }
        formData.append("type", data.type);
        
        try {
            loadingToast = toast.loading("Applying leave ...");
            await axios
                .post(`${BASE_URL}/users/leave/apply_leave?userId=${userId}`, formData, {
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then((res) => {
                    toast.success(res.data.message);
                    setRefresh(refresh + 1);
                    // Reset form
                    setData({
                        contact_number: "",
                        startingDate: "",
                        ending_date: "",
                        noOfDays: "",
                        reason: "",
                        file: null,
                        type: "",
                    });
                })
                .catch((err) => {
                    toast.error(`${err.response?.data?.message || "Error applying leave"}`);
                });
        } catch (err) {
            toast.error("Something went wrong, Try logging in again");
            errorHandleLogout();
        } finally {
            // Close the loading state
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
        }
    };

    const [leaveBalance, setLeaveBalance] = useState({
        sl: 0,
        el: 0,
        cl: 0,
        fl: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios
                    .get(
                        `${BASE_URL}/users/leave/view_leave_balance?userId=${userId}&month=${month}&year=${year}`,
                        { headers: headers }
                    );
                if (res.data.leaveBalance) {
                    setLeaveBalance(res.data.leaveBalance);
                }
            } catch (err) {
                // Silent fail
            }
        };
        if (userId) {
            fetchData();
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Submit your leave request and track its status
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Leave Balance, Calendar, Holidays */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Leave Balance Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <BsClockHistory className="text-[#8BD005]" />
                                Available Leave Balance
                            </h2>
                            {leaveBalance && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <label className="block text-sm text-gray-500 mb-1">SL</label>
                                        <p className="text-xl font-bold text-[#1B2749]">{leaveBalance.sl || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <label className="block text-sm text-gray-500 mb-1">EL</label>
                                        <p className="text-xl font-bold text-[#1B2749]">{leaveBalance.el || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <label className="block text-sm text-gray-500 mb-1">CL</label>
                                        <p className="text-xl font-bold text-[#1B2749]">{leaveBalance.cl || 0}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <label className="block text-sm text-gray-500 mb-1">FL</label>
                                        <p className="text-xl font-bold text-[#1B2749]">{leaveBalance.fl || 0}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Calendar Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <BsCalendarDate className="text-[#8BD005]" />
                                Select Date
                            </h2>
                            <Calendar
                                onChange={handelCalender}
                                value={selectedData}
                                className="border-0 w-full"
                            />
                        </div>

                        {/* Holidays Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaCalendarAlt className="text-[#8BD005]" />
                                Holidays - {year}
                            </h2>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {holiday.length > 0 ? (
                                    holiday.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 mt-2 bg-[#8BD005] rounded-full"></div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {new Date(item.dte).toLocaleDateString('en-GB')}
                                                </p>
                                                <p className="text-xs text-gray-500">{item.name}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No holidays found</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Leave Application Form and Table */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Application Form Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <FaFileAlt className="text-[#8BD005]" />
                                Leave Application Form
                            </h2>

                            <form onSubmit={handelSubmit} className="space-y-6">
                                {/* Contact Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <input
                                            type="number"
                                            value={data.contact_number}
                                            onChange={(e) => setData({ ...data, contact_number: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                            placeholder="Enter contact number"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                                        <FaInfoCircle size={12} />
                                        This contact will be used for all leave applications
                                    </p>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.startingDate}
                                            onChange={handleStartingDateChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.ending_date}
                                            onChange={handleEndingDateChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Leave Type and Days */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Leave Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => {
                                                const selectedValue = e.target.value;
                                                const noOfDays = selectedValue === "Half Day" ? 0.5 : data.noOfDays;
                                                setData({
                                                    ...data,
                                                    type: selectedValue,
                                                    noOfDays: noOfDays,
                                                });
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select leave type</option>
                                            <option value="Adoption Leave">Adoption Leave</option>
                                            <option value="Advance Earned Leave">Advance Earned Leave</option>
                                            <option value="Casual Leave">Casual Leave</option>
                                            <option value="Half Day">Half Day</option>
                                            <option value="Earned Leave">Earned Leave</option>
                                            <option value="Flexi holiday">Flexi holiday</option>
                                            <option value="LWP- Unable to work">LWP- Unable to work</option>
                                            <option value="Leave without pay">Leave without pay</option>
                                            <option value="Sick leave">Sick leave</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Days
                                        </label>
                                        <input
                                            type="text"
                                            value={data.noOfDays}
                                            readOnly
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                        />
                                    </div>
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Detailed Reason <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MdDescription className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <textarea
                                            value={data.reason}
                                            onChange={(e) => setData({ ...data, reason: e.target.value })}
                                            rows={3}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                            placeholder="Provide detailed reason for leave"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Document (Optional)
                                    </label>
                                    <div className="relative">
                                        <MdAttachFile className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#8BD005] file:text-white hover:file:bg-[#6d971a]"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-linear-to-r from-[#1B2749] to-[#8BD005] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                    >
                                        Apply for Leave
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Leave History Table Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <BsCalendarDate className="text-[#8BD005]" />
                                Leave History
                            </h2>

                            {arrayData && arrayData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {arrayData.map((item, index) => (
                                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.startDate)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.endDate)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{item.type}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{item.noOfDays}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            item.status === 'approved' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : item.status === 'rejected'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handelDelete(index)}
                                                            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaFileAlt className="text-gray-400" size={24} />
                                    </div>
                                    <p className="text-gray-500">No leave applications found</p>
                                    <p className="text-sm text-gray-400 mt-1">Apply for leave using the form above</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyLeave;