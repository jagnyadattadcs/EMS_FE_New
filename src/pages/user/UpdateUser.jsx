import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { 
    FaUser, 
    FaEnvelope, 
    FaLock, 
    FaPhone, 
    FaCalendarAlt, 
    FaCamera, 
    FaSave,
    FaSpinner,
    FaExclamationCircle,
    FaArrowLeft,
    FaImage
} from "react-icons/fa";
import { MdUpload, MdUpdate } from "react-icons/md";

const UpdateUser = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    let loadingToast;
    const { errorHandleLogout } = useAuth();
    const [previewImage, setPreviewImage] = useState(null);
    const [pathValue, setPathValue] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    // Redirect if not employee
    useEffect(() => {
        if (token && role !== "emp") {
            navigate("/admin/home");
        }
    }, [token, role, navigate]);

    const [data, setData] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        dob: '',
        dp: null,
    });

    useEffect(() => {
        if (data) {
            setFormData({
                name: data.name || '',
                email: data.email || '',
                password: data.password || '',
                phone: data.phone || '',
                dob: data.dob || '',
                dp: data.dp || null
            });
        }
    }, [data]);

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/users/profile?userId=${userId}`, {
                    headers: headers,
                });
                setData(res.data.user);
            } catch (err) {
                toast.error("Unable to fetch data");
                console.error("Error fetching profile:", err);
            }
        };

        if (userId && token) {
            fetchUserProfile();
        }
    }, [userId, token]);

    // Check session
    useEffect(() => {
        if (!userId) {
            toast.warn("Session Timeout");
            localStorage.removeItem("token");
            navigate("/");
        }
    }, [userId, navigate]);

    const handleChange = (event) => {
        const file = event.target.files[0];
        setError(null);
        
        if (file) {
            setPathValue(file);
            
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

            // Create preview image
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("Please fill all required fields");
            return;
        }

        const formDatas = new FormData();
        formDatas.append("email", formData.email);
        formDatas.append('password', formData.password);
        formDatas.append('phone', formData.phone);
        formDatas.append('name', formData.name);
        formDatas.append('dob', formData.dob);
        
        if (pathValue) {
            formDatas.append('image', pathValue);
        }

        try {
            setIsLoading(true);
            setUploadProgress(0);
            loadingToast = toast.loading("Updating profile...");

            const res = await axios.post(`${BASE_URL}/users/update?userId=${userId}`, formDatas, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            toast.dismiss(loadingToast);
            toast.success(res.data.message || "Profile updated successfully");
            
            // Update localStorage with new name if changed
            if (formData.name) {
                localStorage.setItem('name', formData.name);
            }
            
            navigate("/");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || "Something went wrong, try again later");
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#1B2749] transition-colors"
                    >
                        <FaArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Update <span className="text-[#8BD005]">Profile</span>
                    </h1>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Image Section */}
                    <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-8">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            {/* Previous Image */}
                            {formData.dp && (
                                <div className="text-center">
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Current Profile
                                    </label>
                                    <div className="relative group">
                                        <img 
                                            src={`${formData.dp}`} 
                                            alt="Current Profile" 
                                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <FaImage className="text-white text-2xl" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preview Image */}
                            {previewImage && (
                                <div className="text-center">
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        New Profile
                                    </label>
                                    <div className="relative group">
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="w-32 h-32 rounded-full object-cover border-4 border-[#8BD005] shadow-lg group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <FaCamera className="text-white text-2xl" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Placeholder if no images */}
                            {!formData.dp && !previewImage && (
                                <div className="text-center">
                                    <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                                        <FaUser className="text-gray-400 text-4xl" />
                                    </div>
                                    <p className="mt-3 text-sm text-gray-300">No profile image</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                                <FaExclamationCircle className="text-red-500 shrink-0" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your full name"
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
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your email"
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
                                        value={formData.password || ''}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                        placeholder="Leave blank to keep current password"
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
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date of Birth Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.dob ? formData.dob.split("T")[0] : ""}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Profile Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Update Profile Picture
                                </label>
                                <div className="relative">
                                    <MdUpload className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#8BD005] file:text-white hover:file:bg-[#6d971a]"
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Accepted formats: JPEG, PNG, JPG. Max size: 2MB
                                </p>
                            </div>

                            {/* Upload Progress Bar */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-[#8BD005] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-[#1B2749] to-[#8BD005] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Update Profile
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <FaExclamationCircle className="text-blue-500 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">Profile Update Information</h3>
                            <p className="text-xs text-blue-700 mt-1">
                                Your profile information will be updated across the system. Make sure all details are accurate before submitting.
                                The changes will reflect immediately after successful update.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateUser;