import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaArrowLeft, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { MdOutlineCalendarToday, MdOutlinePerson, MdOutlineWorkOutline } from 'react-icons/md';

const LeaveApplication = () => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const navigate = useNavigate();
    const [option, setOption] = useState("all");
    const [datas, setDatas] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem("adminSetUser");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // Custom sort function (replacing lodash)
    const sortData = (data, key, direction) => {
        return [...data].sort((a, b) => {
            let aValue = key.includes('.') ? getNestedValue(a, key) : a[key];
            let bValue = key.includes('.') ? getNestedValue(b, key) : b[key];
            
            // Handle date fields
            if (key === 'createdAt' || key === 'startDate' || key === 'endDate') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }
            
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Helper to get nested object values (e.g., 'user.name')
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let url;
                if (userId) {
                    url = `${BASE_URL}/users/leave/view_particular_leaves?status=${option}&userId=${userId}`;
                } else {
                    url = `${BASE_URL}/users/leave/view_leaves?status=${option}`;
                }
                
                const res = await axios.get(url, { headers });
                
                // Manual sorting without lodash
                const sortedData = sortData(res.data.data, 'createdAt', 'desc');
                setDatas(sortedData);
            } catch (err) {
                toast.error("Something went wrong");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [option, refresh, userId]);

    const formatDate = (inputDate) => {
        if (!inputDate || isNaN(new Date(inputDate))) {
            return "Invalid Date";
        }
        const date = new Date(inputDate);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleApprove = async (leaveId) => {
        try {
            const res = await axios.patch(
                `${BASE_URL}/users/leave/approve_leave?leaveId=${leaveId}`,
                {},
                { headers }
            );
            toast.success(res.data.message || "Leave approved successfully");
            setRefresh(prev => prev + 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error approving leave");
        }
    };

    const handleReject = async (leaveId) => {
        try {
            const res = await axios.patch(
                `${BASE_URL}/users/leave/reject_leave?leaveId=${leaveId}`,
                {},
                { headers }
            );
            toast.success(res.data.message || "Leave rejected successfully");
            setRefresh(prev => prev + 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error rejecting leave");
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
        
        const sorted = sortData(datas, key, sortConfig.direction === 'desc' ? 'asc' : 'desc');
        setDatas(sorted);
    };

    // Filter data based on search term
    const filteredDatas = datas.filter(data => {
        const searchLower = searchTerm.toLowerCase();
        return (
            data.user?.empId?.toLowerCase().includes(searchLower) ||
            data.user?.name?.toLowerCase().includes(searchLower) ||
            data.type?.toLowerCase().includes(searchLower) ||
            data.status?.toLowerCase().includes(searchLower)
        );
    });

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with Back Button */}
                {userId && (
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => {
                                navigate("/admin/home");
                                localStorage.removeItem("adminSetUser");
                            }}
                            className="flex items-center gap-2 text-[#1B2749] hover:text-[#8BD005] transition-colors"
                        >
                            <FaArrowLeft size={20} />
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                )}

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1B2749]">Leave Applications</h1>
                    <p className="text-gray-500 mt-1">Manage and track employee leave requests</p>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaFilter className="inline mr-2 text-[#8BD005]" />
                                Filter by Status
                            </label>
                            <select
                                value={option}
                                onChange={(e) => setOption(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent bg-white"
                            >
                                <option value="all">All Applications</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Search Bar */}
                        <div className="relative md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaSearch className="inline mr-2 text-[#8BD005]" />
                                Search Employee
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, employee ID, leave type..."
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#8BD005] border-t-transparent"></div>
                        <p className="mt-2 text-gray-500">Loading applications...</p>
                    </div>
                )}

                {/* Table Section */}
                {!loading && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sl.No
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#8BD005]"
                                            onClick={() => handleSort('user.empId')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Emp ID
                                                {sortConfig.key === 'user.empId' && (
                                                    sortConfig.direction === 'desc' ? 
                                                    <FaSortAmountDown size={12} /> : 
                                                    <FaSortAmountUp size={12} />
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#8BD005]"
                                            onClick={() => handleSort('user.name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Employee Name
                                                {sortConfig.key === 'user.name' && (
                                                    sortConfig.direction === 'desc' ? 
                                                    <FaSortAmountDown size={12} /> : 
                                                    <FaSortAmountUp size={12} />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Leave Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Start Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            End Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No. of Days
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        {(option === "all" || option === "pending" || option === "rejected") && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Approve
                                            </th>
                                        )}
                                        {(option === "all" || option === "pending" || option === "approved") && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reject
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDatas.length > 0 ? (
                                        filteredDatas.map((data, index) => (
                                            <tr key={data._id || index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {data.user?.empId || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <MdOutlinePerson className="text-[#8BD005]" />
                                                        {data.user?.name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <MdOutlineWorkOutline className="text-[#8BD005]" />
                                                        {data.type}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <MdOutlineCalendarToday className="text-[#8BD005]" />
                                                        {formatDate(data.startDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <MdOutlineCalendarToday className="text-[#8BD005]" />
                                                        {formatDate(data.endDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {data.noOfDays}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(data.status)}`}>
                                                        {data.status}
                                                    </span>
                                                </td>
                                                {(option === "all" || option === "pending" || option === "rejected") && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleApprove(data._id)}
                                                            className="text-green-600 hover:text-green-800 hover:scale-110 transition-all duration-200"
                                                            title="Approve Leave"
                                                            disabled={data.status === 'approved'}
                                                        >
                                                            <FaCheck size={20} />
                                                        </button>
                                                    </td>
                                                )}
                                                {(option === "all" || option === "pending" || option === "approved") && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleReject(data._id)}
                                                            className="text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200"
                                                            title="Reject Leave"
                                                            disabled={data.status === 'rejected'}
                                                        >
                                                            <FaTimes size={20} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td 
                                                colSpan="11" 
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <MdOutlineCalendarToday size={48} className="text-gray-300 mb-4" />
                                                    <p className="text-lg">No {option} applications found</p>
                                                    <p className="text-sm">Try adjusting your filters or search term</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveApplication;