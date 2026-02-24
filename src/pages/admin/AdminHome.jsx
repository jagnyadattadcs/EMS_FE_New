import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify";
import { 
    FaLock, 
    FaUnlockAlt, 
    FaUserCircle, 
    FaEnvelope, 
    FaPhone, 
    FaWhatsapp,
    FaTimes,
    FaEllipsisV,
    FaChevronRight,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaSearch,
    FaFilter,
    FaDownload,
    FaEye,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaBriefcase,
    FaIdCard,
    FaUserTie,
    FaProjectDiagram,
    FaBan
} from "react-icons/fa";
import { MdEmail, MdDelete, MdEdit, MdVisibility, MdMoreVert } from "react-icons/md";
import { BsThreeDotsVertical, BsWhatsapp } from "react-icons/bs";
import UpdateDetails from "./UpdateDetails";

const AdminHome = () => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [employeeData, setEmployeeData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDiv, setShowDiv] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterLock, setFilterLock] = useState("all");

    const [isPermanentDelete, setIsPermanentDelete] = useState(false);
    const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [confirmText, setConfirmText] = useState(null);
    const [enteredText, setEnteredText] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [id, setId] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = React.useMemo(() => ({
        Authorization: `Bearer ${token}`,
    }), [token]);
    const fetchExecutedRef = useRef(false);
    let loadingToast;

    // Fetch employee data
    useEffect(() => {
        if (fetchExecutedRef.current) return;
        fetchExecutedRef.current = true;

        let isMounted = true;
        let loadingToastId = null;
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const response = await fetch(`${BASE_URL}/users/get_all_user`, { 
                    headers: headers 
                });
                const data = await response.json();
                
                if (data.success) {
                    setEmployeeData(data?.users || []);
                    setFilteredData(data?.users || []);
                    toast.success('Users data loaded successfully');
                } else {
                    setError("Failed to fetch data");
                    toast.error("Failed to fetch data");
                }
            } catch (error) {
                setError("Error fetching data");
                toast.error("Error fetching data");
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            fetchData();
        } else {
            setLoading(false);
            toast.error("No authentication token found");
            navigate("/login");
        }

        return () => {
            isMounted = false;
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
        };
    }, [BASE_URL, token, navigate]);

    // Filter employees based on search and filters
    useEffect(() => {
        let filtered = [...employeeData];
        
        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(emp => 
                emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter(emp => 
                filterStatus === "active" ? emp.isACTIVE : !emp.isACTIVE
            );
        }
        
        // Lock filter
        if (filterLock !== "all") {
            filtered = filtered.filter(emp => 
                filterLock === "locked" ? emp.isLOCKED : !emp.isLOCKED
            );
        }
        
        setFilteredData(filtered);
    }, [searchTerm, filterStatus, filterLock, employeeData]);

    const handleInputChange = (event) => {
        setEnteredText(event.target.value);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsPermanentDelete(false);
        setEnteredText('');
    };

    const handleShowModal = (index) => {
        setSelectedEmployeeIndex(index);
        const selectedEmployee = filteredData[index];
        
        // Close all dropdowns first
        const newShowDiv = showDiv.map(() => false);
        setShowDiv(newShowDiv);
        
        setShowModal(true);
        
        if (selectedEmployee) {
            let randomCode = uuidv4().slice(0, 6);
            let aa = `Delete ${selectedEmployee.name || selectedEmployee.email} ${randomCode}`;
            setConfirmText(aa);
        }
    };

    const handleRemoveAction = async () => {
        const index = selectedEmployeeIndex;
        if (index !== null) {
            const userId = filteredData[index]._id;
            const action = isPermanentDelete ? 'permanently' : 'temporarily';
            const actionURL = isPermanentDelete ? 'perm_delete_user' : 'temp_delete_user';
            
            const deleteToast = toast.loading(`${action} deleting user...`);
            
            try {
                const res = await axios.delete(`${BASE_URL}/users/${actionURL}?userId=${userId}`, { 
                    headers: headers 
                });
                
                const updatedEmployeeData = employeeData.filter(emp => emp._id !== userId);
                setEmployeeData(updatedEmployeeData);
                
                toast.update(deleteToast, {
                    render: `${action} deletion successful for ${filteredData[index].name || filteredData[index].email}`,
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });
                
            } catch (err) {
                console.error(`Failed to ${action} delete user`, err);
                toast.update(deleteToast, {
                    render: `Failed to ${action} delete user`,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            }
        }
        handleCloseModal();
    };

    const handleDropdownClick = (index) => {
        const newShowDiv = showDiv.map(() => false);
        newShowDiv[index] = !showDiv[index];
        setShowDiv(newShowDiv);
    };

    const handleLockAction = async (index) => {
        const employee = filteredData[index];
        const email = employee.email;
        const action = employee.isLOCKED ? 'UNLOCK' : 'LOCK';

        const confirmAction = window.confirm(`Are you sure you want to ${action} ${employee.name}?`);

        if (confirmAction) {
            const lockToast = toast.loading(`${action}ing account...`);
            
            try {
                const response = await fetch(`${BASE_URL}/users/toogle_account_lock?email=${email}`, { 
                    headers: headers 
                });
                const data = await response.json();
                
                if (data.success) {
                    const updatedEmployeeData = employeeData.map(emp => 
                        emp._id === employee._id 
                            ? { ...emp, isLOCKED: !emp.isLOCKED }
                            : emp
                    );
                    setEmployeeData(updatedEmployeeData);
                    
                    toast.update(lockToast, {
                        render: `Account ${action}ed successfully for ${employee.name}`,
                        type: "success",
                        isLoading: false,
                        autoClose: 3000
                    });
                } else {
                    toast.update(lockToast, {
                        render: `Failed to ${action} account for ${employee.name}`,
                        type: "error",
                        isLoading: false,
                        autoClose: 3000
                    });
                }
            } catch (error) {
                console.error(`Error while ${action}ing account`, error);
                toast.update(lockToast, {
                    render: `Error while ${action}ing account`,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            }
        }
    };

    const handleUpdateData = (value) => {
        setId(value);
        setShowForm(true);
    };

    const handleImageError = (e) => {
        e.target.src = ''; // Remove broken image
        e.target.onerror = null; // Prevent infinite loop
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterStatus("all");
        setFilterLock("all");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-[#8BD005] mx-auto mb-4" />
                    <p className="text-gray-600">Loading employees...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error: {error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-[#8BD005] text-white rounded-lg hover:bg-[#6d971a]"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Admin <span className="text-[#8BD005]">Dashboard</span>
                    </h1>
                    <p className="text-gray-600 mt-2">Manage employees and their details</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Employees
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, ID, designation..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employment Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Lock Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Status
                            </label>
                            <select
                                value={filterLock}
                                onChange={(e) => setFilterLock(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                            >
                                <option value="all">All Accounts</option>
                                <option value="locked">Locked</option>
                                <option value="unlocked">Unlocked</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(searchTerm || filterStatus !== "all" || filterLock !== "all") && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-gray-500">Active filters:</span>
                            {searchTerm && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs flex items-center gap-1">
                                    Search: {searchTerm}
                                    <FaTimes 
                                        className="cursor-pointer hover:text-blue-900"
                                        onClick={() => setSearchTerm("")}
                                    />
                                </span>
                            )}
                            {filterStatus !== "all" && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs flex items-center gap-1">
                                    Status: {filterStatus}
                                    <FaTimes 
                                        className="cursor-pointer hover:text-green-900"
                                        onClick={() => setFilterStatus("all")}
                                    />
                                </span>
                            )}
                            {filterLock !== "all" && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs flex items-center gap-1">
                                    Account: {filterLock}
                                    <FaTimes 
                                        className="cursor-pointer hover:text-purple-900"
                                        onClick={() => setFilterLock("all")}
                                    />
                                </span>
                            )}
                            <button
                                onClick={handleClearFilters}
                                className="text-xs text-red-600 hover:text-red-800"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Total Employees</p>
                        <p className="text-2xl font-bold text-[#1B2749]">{employeeData.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                            {employeeData.filter(emp => emp.isACTIVE).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Locked</p>
                        <p className="text-2xl font-bold text-red-600">
                            {employeeData.filter(emp => emp.isLOCKED).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-500">Showing</p>
                        <p className="text-2xl font-bold text-[#8BD005]">{filteredData.length}</p>
                    </div>
                </div>

                {/* Employee Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Active</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">DP</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Emp ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Designation</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Projects</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((employee, index) => (
                                    <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                                        {/* Account Status */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleLockAction(index)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    employee.isLOCKED 
                                                        ? 'text-red-600 hover:bg-red-50' 
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={employee.isLOCKED ? 'Unlock Account' : 'Lock Account'}
                                            >
                                                {employee.isLOCKED ? <FaLock size={16} /> : <FaUnlockAlt size={16} />}
                                            </button>
                                        </td>

                                        {/* Employment Status */}
                                        <td className="px-4 py-3">
                                            {employee.isACTIVE ? (
                                                <FaCheckCircle className="text-green-500" size={16} />
                                            ) : (
                                                <FaTimesCircle className="text-red-500" size={16} />
                                            )}
                                        </td>

                                        {/* Profile Picture */}
                                        <td className="px-4 py-3">
                                            {employee.dp ? (
                                                <div className="relative group">
                                                    <img
                                                        src={`${BASE_URL}${employee.dp}`}
                                                        alt={employee.name}
                                                        className="w-8 h-8 rounded-full object-cover border-2 border-[#8BD005]"
                                                        onError={handleImageError}
                                                    />
                                                    <div className="absolute left-0 top-0 hidden group-hover:block z-10">
                                                        <img
                                                            src={`${BASE_URL}${employee.dp}`}
                                                            alt={employee.name}
                                                            className="w-32 h-32 rounded-lg object-cover border-4 border-[#8BD005] shadow-xl"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <FaUserCircle className="text-gray-400 text-2xl" />
                                            )}
                                        </td>

                                        {/* Employee ID */}
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            {employee.empId || 'N/A'}
                                        </td>

                                        {/* Name */}
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {employee.name || 'N/A'}
                                        </td>

                                        {/* Email */}
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-37.5">{employee.email}</span>
                                                <a
                                                    href={`mailto:${employee.email}`}
                                                    className="text-[#8BD005] hover:text-[#6d971a]"
                                                    title="Send Email"
                                                >
                                                    <FaEnvelope size={14} />
                                                </a>
                                            </div>
                                        </td>

                                        {/* Phone */}
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {employee.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <span>{employee.phone}</span>
                                                    <a
                                                        href={`https://wa.me/${employee.phone}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-700"
                                                        title="WhatsApp"
                                                    >
                                                        <FaWhatsapp size={14} />
                                                    </a>
                                                </div>
                                            ) : 'N/A'}
                                        </td>

                                        {/* Designation */}
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {employee.designation || 'N/A'}
                                        </td>

                                        {/* Projects */}
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div className="max-w-50">
                                                {employee?.projects
                                                    ?.filter((project) => project?.status !== "dropped")
                                                    .map((project, idx) => (
                                                        <div key={idx} className="text-xs text-gray-600 truncate">
                                                            {project?.projectId?.name || 'No Project'}
                                                        </div>
                                                    ))}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 relative">
                                            <button
                                                onClick={() => handleDropdownClick(index)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <BsThreeDotsVertical className="text-gray-600" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {showDiv[index] && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                                                    <button
                                                        onClick={() => {
                                                            localStorage.setItem("adminSetUser", employee._id);
                                                            navigate("/timesheet");
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <FaCalendarAlt size={14} className="text-[#8BD005]" />
                                                        Timesheet
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateData(employee._id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <FaEdit size={14} className="text-blue-500" />
                                                        Update Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleShowModal(index)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <FaTrash size={14} />
                                                        Remove
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            localStorage.setItem("adminSetUser", employee._id);
                                                            navigate("/admin/leave_appliacation");
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <FaEye size={14} className="text-purple-500" />
                                                        Leave List
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredData.length === 0 && (
                        <div className="p-12 text-center">
                            <FaUserCircle className="text-5xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No employees found</h3>
                            <p className="text-gray-500">
                                {searchTerm || filterStatus !== "all" || filterLock !== "all"
                                    ? "Try adjusting your filters"
                                    : "No employees available"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Update Form Modal */}
                {showForm && <UpdateDetails setShowForm={setShowForm} id={id} />}

                {/* Delete Confirmation Modal */}
                {showModal && selectedEmployeeIndex !== null && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-slideIn">
                            <div className="bg-linear-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-xl">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FaExclamationTriangle />
                                    Remove Employee
                                </h2>
                            </div>

                            <div className="p-6">
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to remove{' '}
                                    <span className="font-bold">
                                        {filteredData[selectedEmployeeIndex]?.name || 
                                         filteredData[selectedEmployeeIndex]?.email}
                                    </span>?
                                </p>

                                <label className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={isPermanentDelete}
                                        onChange={() => setIsPermanentDelete(!isPermanentDelete)}
                                        className="w-4 h-4 text-[#8BD005] rounded focus:ring-[#8BD005]"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Delete permanently
                                    </span>
                                </label>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        To confirm, type "<span className="font-bold text-red-600">{confirmText}</span>" in the box below
                                    </p>
                                    <input
                                        type="text"
                                        value={enteredText}
                                        onChange={handleInputChange}
                                        placeholder="Type here..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRemoveAction}
                                        disabled={enteredText !== confirmText}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                            enteredText === confirmText
                                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={handleCloseModal}
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

            {/* Animation Styles */}
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

export default AdminHome;