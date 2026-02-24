import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import { FiX, FiPlus, FiSave, FiClock, FiCode, FiUser } from "react-icons/fi";

const UpdateProject = ({ index, projectList, setShowComponent, setRefresh, refresh }) => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const { errorHandleLogout } = useAuth();
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        deadline: "",
        description: {},
        tempKey: "",
        tempValue: "",
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (projectList[index]) {
            setFormData((prevData) => ({
                ...prevData,
                name: projectList[index].name || "",
                code: projectList[index].code || "",
                deadline: projectList[index].deadline 
                    ? new Date(projectList[index].deadline).toISOString().split('T')[0]
                    : "",
                description: projectList[index].description || {},
            }));
        }
    }, [index, projectList]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = "Project name is required";
        }
        if (!formData.code.trim()) {
            newErrors.code = "Project code is required";
        }
        if (!formData.deadline) {
            newErrors.deadline = "Deadline is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleDescriptionChange = (key, value) => {
        setFormData((prevData) => ({
            ...prevData,
            description: {
                ...prevData.description,
                [key]: value,
            },
        }));
    };

    const handleAddDescription = () => {
        if (formData.tempKey && formData.tempValue) {
            setFormData((prevData) => ({
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
            toast.warning("Please enter both key and value");
        }
    };

    const handleRemoveDescription = (keyToRemove) => {
        const updatedDescription = { ...formData.description };
        delete updatedDescription[keyToRemove];
        
        setFormData((prevData) => ({
            ...prevData,
            description: updatedDescription,
        }));
        
        toast.info("Description field removed");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        let loadingToast;

        try {
            loadingToast = toast.loading("Updating project...");
            
            const res = await axios.patch(
                `${BASE_URL}/projects/update?projectId=${projectList[index]._id}`,
                formData,
                { headers: headers }
            );

            toast.dismiss(loadingToast);
            toast.success(res.data.message || "Project updated successfully");
            
            setRefresh(refresh + 1);
            
            // Success animation before closing
            setTimeout(() => {
                setShowComponent(false);
            }, 500);

        } catch (err) {
            if (loadingToast) toast.dismiss(loadingToast);
            
            const errorMessage = err.response?.data?.message || "Something went wrong";
            toast.error(errorMessage);
            
            if (err.response?.status === 401) {
                errorHandleLogout();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp">
                
                {/* Header */}
                <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-6 sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FiUser className="text-[#8BD005]" />
                            Update Project
                        </h2>
                        <button
                            onClick={() => setShowComponent(false)}
                            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                        Editing: <span className="text-[#8BD005] font-medium">{formData.name || projectList[index]?.name}</span>
                    </p>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Project Name and Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Project Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter project name"
                                    className={`w-full px-4 py-2.5 rounded-lg border ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200`}
                                    disabled={isSubmitting}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Project Code */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Code <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FiCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g., PRJ-001"
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                            errors.code ? 'border-red-500' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200`}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.code && (
                                    <p className="text-xs text-red-500 mt-1">{errors.code}</p>
                                )}
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Deadline <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                                        errors.deadline ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.deadline && (
                                <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Description Fields
                            </label>

                            {/* Existing Description Fields */}
                            <div className="space-y-3">
                                {Object.entries(formData.description).map(([key, value], idx) => (
                                    <div key={idx} className="flex items-center gap-2 group animate-fadeIn">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={key}
                                                onChange={(e) => {
                                                    const newKey = e.target.value;
                                                    const oldValue = value;
                                                    handleRemoveDescription(key);
                                                    setTimeout(() => {
                                                        handleDescriptionChange(newKey, oldValue);
                                                    }, 0);
                                                }}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] bg-gray-50"
                                                placeholder="Key"
                                                disabled={isSubmitting}
                                            />
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleDescriptionChange(key, e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005]"
                                                placeholder="Value"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDescription(key)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            disabled={isSubmitting}
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add New Description Field */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Field</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={formData.tempKey}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tempKey: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005]"
                                        disabled={isSubmitting}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={formData.tempValue}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tempValue: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005]"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddDescription}
                                        className="px-4 py-2 bg-[#8BD005] hover:bg-[#6d971a] text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        <FiPlus size={18} />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-linear-to-r from-[#1B2749] to-[#2a3a5e] hover:from-[#2a3a5e] hover:to-[#1B2749] text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FiSave size={18} />
                                        Update Project
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowComponent(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                disabled={isSubmitting}
                            >
                                Cancel
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
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default UpdateProject;
