import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiTrash2, FiUserX, FiAlertCircle, FiSearch } from 'react-icons/fi';

const DeletedEmployee = () => {
    const [datas, setDatas] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    useEffect(() => {
        const fetchDeletedUsers = async () => {
            setLoading(true);
            const loadingToast = toast.loading("Loading deleted employees...");
            
            try {
                const res = await axios.get(`${BASE_URL}/users/get_deleted_user`, { headers });
                if (res.data) {
                    setDatas(res.data.users);
                    toast.update(loadingToast, {
                        render: res.data.message || "Deleted employees loaded!",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000
                    });
                }
            } catch (err) {
                toast.update(loadingToast, {
                    render: err.response?.data?.message || "Failed to load deleted employees",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDeletedUsers();
    }, [refresh]);

    const handleRetrieve = async (index) => {
        const confirmRetrieve = window.confirm("Are you sure you want to retrieve this employee?");
        if (!confirmRetrieve) return;

        const loadingToast = toast.loading("Retrieving employee...");
        
        try {
            const res = await axios.get(`${BASE_URL}/users/retrive_user?userId=${datas[index]._id}`, { headers });
            
            toast.update(loadingToast, {
                render: res.data.message || "Employee retrieved successfully!",
                type: "success",
                isLoading: false,
                autoClose: 2000
            });
            
            setRefresh(prev => prev + 1);
        } catch (err) {
            toast.update(loadingToast, {
                render: err.response?.data?.message || "Failed to retrieve employee",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    const handlePermanentDelete = async (index) => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this employee? This action cannot be undone!");
        if (!confirmDelete) return;

        const loadingToast = toast.loading("Permanently deleting employee...");
        
        try {
            const res = await axios.delete(`${BASE_URL}/users/perm_delete_user?userId=${datas[index]._id}`, { headers });
            
            toast.update(loadingToast, {
                render: res.data.message || "Employee permanently deleted!",
                type: "success",
                isLoading: false,
                autoClose: 2000
            });
            
            setRefresh(prev => prev + 1);
        } catch (err) {
            toast.update(loadingToast, {
                render: err.response?.data?.message || "Failed to delete employee",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    // Filter employees based on search
    const filteredEmployees = datas.filter(employee => {
        const searchLower = searchTerm.toLowerCase();
        return (
            employee.empId?.toLowerCase().includes(searchLower) ||
            employee.name?.toLowerCase().includes(searchLower) ||
            employee.designation?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        Deleted Employees
                    </h1>
                    <p className="text-gray-600">
                        Manage and restore deleted employee records
                    </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by ID, name or designation..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#8BD005]">
                    <p className="text-sm text-gray-600 mb-1">Total Deleted</p>
                    <p className="text-2xl font-bold text-gray-800">{datas.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-1">Can be Restored</p>
                    <p className="text-2xl font-bold text-gray-800">{datas.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600 mb-1">With Projects</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {datas.filter(emp => emp.projects?.length > 0).length}
                    </p>
                </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e]">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Sl.No</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Employee ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Employee Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Designation</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Projects</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Retrieve</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Delete Permanently</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BD005]"></div>
                                            <span className="ml-2 text-gray-600">Loading deleted employees...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee, index) => (
                                    <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            <span className="bg-gray-100 px-2 py-1 rounded">
                                                {employee.empId || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-linear-to-r from-[#1B2749] to-[#2a3a5e] flex items-center justify-center text-white text-xs font-bold">
                                                    {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span className="text-sm text-gray-800">
                                                    {employee.name || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {employee.designation || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                employee.projects?.length > 0 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {employee.projects?.length || 0} Projects
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleRetrieve(index)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-all duration-200 hover:scale-110"
                                                title="Retrieve Employee"
                                            >
                                                <FiRefreshCw size={20} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handlePermanentDelete(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110"
                                                title="Delete Permanently"
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center">
                                        <FiUserX className="mx-auto mb-3 text-gray-400" size={48} />
                                        <p className="text-gray-500 text-lg mb-1">No deleted employees found</p>
                                        <p className="text-gray-400 text-sm">
                                            {searchTerm ? 'Try adjusting your search' : 'Deleted employees will appear here'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <FiAlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">About Deleted Employees</h4>
                    <p className="text-sm text-blue-700">
                        Deleted employees are temporarily stored here. You can either retrieve them back to active status 
                        or permanently delete them from the system. Permanent deletion cannot be undone.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DeletedEmployee;