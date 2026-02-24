import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { FiRefreshCw } from "react-icons/fi";

const ChangeProjectStatus = ({ index, projectLIst, setShowChangeStatus, setRefresh, refresh }) => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const [selectOption, setSelectOption] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const statusOptions = [
        { value: "InProgress", label: "In Progress", color: "blue" },
        { value: "OnHold", label: "On Hold", color: "yellow" },
        { value: "Delayed", label: "Delayed", color: "orange" },
        { value: "Dropped", label: "Dropped/Cancelled", color: "red" },
        { value: "Resumed", label: "Resumed", color: "green" },
        { value: "Restart", label: "Restart", color: "purple" },
        { value: "Revise", label: "Revise", color: "indigo" },
        { value: "Testing", label: "Testing", color: "pink" },
        { value: "Completed", label: "Completed", color: "emerald" },
    ];

    const getStatusColor = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        switch(option?.color) {
            case 'blue': return 'bg-blue-100 text-blue-800';
            case 'yellow': return 'bg-yellow-100 text-yellow-800';
            case 'orange': return 'bg-orange-100 text-orange-800';
            case 'red': return 'bg-red-100 text-red-800';
            case 'green': return 'bg-green-100 text-green-800';
            case 'purple': return 'bg-purple-100 text-purple-800';
            case 'indigo': return 'bg-indigo-100 text-indigo-800';
            case 'pink': return 'bg-pink-100 text-pink-800';
            case 'emerald': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectOption) {
            toast.warning("Please select a status");
            return;
        }

        setIsSubmitting(true);

        try {
            const postData = {
                status: selectOption,
            };

            const res = await axios.patch(
                `${BASE_URL}/projects/change_status?projectId=${projectLIst[index]._id}`,
                postData,
                { headers: headers }
            );

            toast.success(res.data.message);
            setShowChangeStatus(false);
            setRefresh(refresh + 1);
            
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={() => setShowChangeStatus(false)}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-6 rounded-t-2xl flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiRefreshCw className="text-[#8BD005]" />
                        Change Project Status
                    </h2>
                    <button
                        onClick={() => setShowChangeStatus(false)}
                        className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6 text-center">
                        <p className="text-gray-600 mb-2">Do you want to change the status?</p>
                        <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                            <span className="text-gray-600">Current Status:</span>
                            <span className={`font-semibold px-3 py-1 rounded-full text-sm ${getStatusColor(projectLIst[index]?.status)}`}>
                                {projectLIst[index]?.status}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Status Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select New Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectOption}
                                onChange={(e) => setSelectOption(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200 bg-white"
                                disabled={isSubmitting}
                                required
                            >
                                <option value="" disabled>Choose a status...</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Preview of selected status */}
                        {selectOption && (
                            <div className="bg-blue-50 p-3 rounded-lg animate-fadeIn">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    <span className="font-medium">New status will be:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectOption)}`}>
                                        {statusOptions.find(opt => opt.value === selectOption)?.label}
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowChangeStatus(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectOption}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className={`flex-1 px-4 py-3 bg-linear-to-r from-[#1B2749] to-[#2a3a5e] text-white rounded-lg transition-all duration-200 font-medium transform ${
                                    isSubmitting || !selectOption 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:scale-[1.02] hover:shadow-lg'
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Updating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <FiRefreshCw className={isHovered ? 'animate-spin' : ''} />
                                        Update Status
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Note */}
                <div className="px-6 pb-6">
                    <p className="text-xs text-gray-500 text-center">
                        Changing project status will notify relevant team members
                    </p>
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
                        transform: translateY(20px);
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
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ChangeProjectStatus;
