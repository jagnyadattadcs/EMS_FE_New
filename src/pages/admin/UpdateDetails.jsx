import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    FaUser, 
    FaEnvelope, 
    FaLock, 
    FaPhone, 
    FaIdCard, 
    FaBriefcase,
    FaCamera,
    FaSave,
    FaTimes,
    FaSpinner,
    FaExclamationCircle,
    FaImage
} from "react-icons/fa";
import { MdUpload, MdUpdate } from "react-icons/md";

const UpdateDetails = ({ setShowForm, id }) => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        image: null,
        empId: "",
        designation: "",
    });

    // Check session
    useEffect(() => {
        if (!userId || !token) {
            toast.warn("Session Timeout");
            localStorage.removeItem("token");
            navigate("/");
        }
    }, [userId, token, navigate]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setFetchLoading(true);
                const res = await axios.get(`${BASE_URL}/users/profile?userId=${id}`, { 
                    headers: headers 
                });
                
                if (res.data.user) {
                    const userData = res.data.user;
                    setData({
                        name: userData.name || "",
                        email: userData.email || "",
                        password: "", // Don't populate password for security
                        phone: userData.phone || "",
                        empId: userData.empId || "",
                        designation: userData.designation || "",
                        image: null,
                    });
                    
                    // Set preview if there's an existing image
                    if (userData.dp) {
                        setPreviewImage(`${BASE_URL}${userData.dp}`);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast.error("Failed to fetch user details");
            } finally {
                setFetchLoading(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setError(null);
        
        if (file) {
            // Check file size (2 MB limit)
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size must be less than 2 MB');
                return;
            }

            // Check file type
            if (!file.type.match('image.*')) {
                setError('Please select a valid image file');
                return;
            }

            setData({ ...data, image: file });
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!data.name || !data.email || !data.phone || !data.empId || !data.designation) {
            toast.error("Please fill all required fields");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Updating user details...");

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("email", data.email);
            formData.append("phone", data.phone);
            formData.append("empId", data.empId);
            formData.append("designation", data.designation);
            
            if (data.password) {
                formData.append("password", data.password);
            }
            
            if (data.image) {
                formData.append("image", data.image);
            }

            const res = await axios.post(`${BASE_URL}/users/update/${id}`, formData, { 
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                }
            });

            toast.update(loadingToast, {
                render: res.data.message || "User updated successfully",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            // Close modal after successful update
            setTimeout(() => {
                setShowForm(false);
            }, 1500);
            
        } catch (error) {
            console.error("Error updating user:", error);
            toast.update(loadingToast, {
                render: error.response?.data?.message || "Failed to update user",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowForm(false);
    };

    if (fetchLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 flex flex-col items-center">
                    <FaSpinner className="animate-spin text-4xl text-[#8BD005] mb-4" />
                    <p className="text-gray-600">Loading user details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideIn">
                {/* Header */}
                <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <MdUpdate className="text-[#8BD005]" />
                        Update User Details
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Preview Section */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group">
                            {previewImage ? (
                                <img 
                                    src={previewImage} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-[#8BD005] shadow-lg group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                                    <FaUser className="text-gray-400 text-4xl" />
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <FaCamera className="text-white text-2xl" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Profile Picture</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <FaExclamationCircle className="text-red-500 shrink-0" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Leave empty to keep current password</p>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaPhone className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </div>

                        {/* Employee ID Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee ID <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaIdCard className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={data.empId}
                                    onChange={(e) => setData({ ...data, empId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter employee ID"
                                    required
                                />
                            </div>
                        </div>

                        {/* Designation Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaBriefcase className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={data.designation}
                                    onChange={(e) => setData({ ...data, designation: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter designation"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Image
                        </label>
                        <div className="relative">
                            <MdUpload className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#8BD005] file:text-white hover:file:bg-[#6d971a]"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Accepted formats: JPEG, PNG, JPG. Max size: 2MB
                        </p>
                    </div>

                    {/* Current Image Info */}
                    {previewImage && !data.image && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <FaImage className="text-blue-500 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800">Current Profile Image</h4>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Upload a new image if you want to change it.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-[#1B2749] to-[#8BD005] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Update User
                                </>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
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

export default UpdateDetails;