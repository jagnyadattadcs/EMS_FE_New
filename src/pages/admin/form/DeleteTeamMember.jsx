import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { FiAlertTriangle } from "react-icons/fi";
import { FaUser, FaUserTag, FaIdCard } from "react-icons/fa";

const DeleteTeamMember = ({ index, tmIndex, projectLIst, setShowDeleteMember, setRefresh, refresh }) => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            toast.error("Please provide a reason for removal");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const res = await axios.delete(
                `${BASE_URL}/projects/remove_member?projectId=${projectLIst[index]._id}&teamMemberId=${projectLIst[index].teamMembers[tmIndex]._id}`,
                {
                    headers: headers,
                    data: { reason },
                }
            );
            
            toast.success(res.data.message);
            setRefresh(refresh + 1);
            setShowDeleteMember(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
            console.error("Error removing team member:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const project = projectLIst?.[index];
    const memberData = project?.teamMembers?.[tmIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 animate-slideUp">
                
                {/* Header */}
                <div className="bg-linear-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FiAlertTriangle className="text-white" size={28} />
                            <h2 className="text-xl font-bold text-white">Remove Team Member</h2>
                        </div>
                        <button
                            onClick={() => setShowDeleteMember(false)}
                            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            aria-label="Close"
                        >
                            <IoClose size={24} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Warning Message */}
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 text-sm flex items-center gap-2">
                            <span className="font-medium">⚠️ Warning:</span>
                            This action will remove the team member from the project. This process cannot be undone.
                        </p>
                    </div>

                    {/* Team Member Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                            Team Member Details
                        </h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaUser className="text-blue-600" size={16} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-800">
                                        {memberData.userId?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <FaUserTag className="text-green-600" size={16} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium text-gray-800">
                                        {memberData.role || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FaIdCard className="text-purple-600" size={16} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Employee ID</p>
                                    <p className="font-medium text-gray-800">
                                        {memberData.userId?.empId || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200 my-4" />

                    {/* Reason for Removal */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Reason for Removal <span className="text-red-500">*</span>
                        </h3>
                        <textarea
                            placeholder="Please provide a detailed reason for removing this team member..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This reason will be recorded for audit purposes
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowDeleteMember(false)}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !reason.trim()}
                            className={`flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg transition-all duration-200 font-medium transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                isSubmitting || !reason.trim() 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:from-red-600 hover:to-red-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Removing...</span>
                                </div>
                            ) : (
                                'Remove Member'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Animation styles */}
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

export default DeleteTeamMember;
