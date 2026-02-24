import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { FiPlus, FiSave, FiX } from "react-icons/fi";
import { BiSearch } from "react-icons/bi";

const roles = [
  "HR Specialist", "HR Manager", "HR Business Partner", "HR Executive", "HR Generalist",
  "HR Recruiter", "Sr HR Recruiter", "Account Manager", "Business Development Manager",
  "Business Partner", "Account Executive", "Project Manager", "Developer", "Sr Developer",
  "Software Developer", "Front End Developer", "Java Developer", "Software Architect",
  "Full Stack Developer", "Web Developer", "Software Engineer", "Freelancer",
  "Internship HR", "Internship IT"
];

const UpdateTeamMember = ({ index, projectLIst, setShowEditMember, setRefresh, refresh, tmIndex }) => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    
    const [Data, setData] = useState({
        role: "",
        staringDate: "",
        description: {},
        tempKey: "",
        tempValue: ""
    });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDescriptionChange = (key, value) => {
        setData((prevData) => ({
            ...prevData,
            description: {
                ...prevData.description,
                [key]: value,
            },
        }));
    };

    const handleAddDescription = () => {
        if (Data.tempKey && Data.tempValue) {
            setData((prevData) => ({
                ...prevData,
                description: {
                    ...prevData.description,
                    [prevData.tempKey]: prevData.tempValue,
                },
                tempKey: "",
                tempValue: "",
            }));
            toast.success("Description field added");
        } else {
            toast.error("Please enter both key and value");
        }
    };

    const handleRemoveDescription = (key) => {
        const newDescription = { ...Data.description };
        delete newDescription[key];
        setData((prevData) => ({
            ...prevData,
            description: newDescription
        }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);
    };

    const handleRoleSelect = (role) => {
        setData({ ...Data, role: role });
        setSearchTerm(role);
        setIsDropdownOpen(false);
    };

    const filteredRoles = roles.filter(role =>
        role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!Data.role) {
            toast.error("Please select a role");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const postData = {
                role: Data.role,
                staringDate: Data.staringDate,
                more: Data.description,
            };
            
            const res = await axios.patch(
                `${BASE_URL}/projects/update_member?projectId=${projectLIst[index]._id}&teamMemberId=${projectLIst[index].teamMembers[tmIndex]._id}`,
                postData,
                { headers: headers }
            );
            
            toast.success(res.data.message);
            setRefresh(refresh + 1);
            setShowEditMember(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const project = projectLIst?.[index];
    const memberData = project?.teamMembers?.[tmIndex];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp">
                
                {/* Header */}
                <div className="sticky top-0 bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-6 rounded-t-2xl flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Update Team Member</h2>
                    <button
                        onClick={() => setShowEditMember(false)}
                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Previous Details Section */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#8BD005] rounded-full"></span>
                                Current Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium text-gray-800">{memberData?.role}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Starting Date</p>
                                    <p className="font-medium text-gray-800">{memberData?.staringDate || 'Not set'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-800">{memberData?.userId?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Employee ID</p>
                                    <p className="font-medium text-gray-800">{memberData?.userId?.empId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Update Details Section */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#8BD005] rounded-full"></span>
                                Update Information
                            </h3>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <div className="relative" ref={dropdownRef}>
                                    <div className="relative">
                                        <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search and select role..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all"
                                        />
                                    </div>
                                    
                                    {isDropdownOpen && filteredRoles.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {filteredRoles.map((role) => (
                                                <div
                                                    key={role}
                                                    onClick={() => handleRoleSelect(role)}
                                                    className="px-4 py-2 hover:bg-[#8BD005] hover:text-white cursor-pointer transition-colors"
                                                >
                                                    {role}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {isDropdownOpen && filteredRoles.length === 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500">
                                            No roles found
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Starting Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Starting Date
                                </label>
                                <input
                                    type="date"
                                    value={Data.staringDate}
                                    onChange={(e) => setData({ ...Data, staringDate: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Description Fields */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Additional Details
                                </label>
                                
                                {Object.entries(Data.description).map(([key, value], index) => (
                                    <div key={index} className="flex items-center gap-2 group">
                                        <div className="flex-1 flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="font-medium text-gray-600 min-w-25">{key}:</span>
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleDescriptionChange(key, e.target.value)}
                                                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8BD005]"
                                                placeholder={`Enter ${key}`}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDescription(key)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                ))}

                                {/* Add New Description Field */}
                                <div className="flex items-center gap-2 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={Data.tempKey}
                                        onChange={(e) => setData((prev) => ({ ...prev, tempKey: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8BD005]"
                                    />
                                    <span className="text-gray-500">:</span>
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={Data.tempValue}
                                        onChange={(e) => setData((prev) => ({ ...prev, tempValue: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8BD005]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddDescription}
                                        className="p-2 bg-[#8BD005] hover:bg-[#6d971a] text-white rounded-lg transition-colors"
                                        title="Add field"
                                    >
                                        <FiPlus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowEditMember(false)}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-linear-to-r from-[#1B2749] to-[#2a3a5e] text-white rounded-lg hover:from-[#2a3a5e] hover:to-[#1B2749] transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FiSave size={18} />
                                        Update Member
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default UpdateTeamMember;
