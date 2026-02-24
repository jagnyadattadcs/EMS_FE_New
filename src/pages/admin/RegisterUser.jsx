import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    FaEnvelope, 
    FaCheckCircle, 
    FaIdCard, 
    FaBriefcase, 
    FaUserPlus,
    FaSpinner,
    FaExclamationCircle,
    FaArrowLeft
} from 'react-icons/fa';
import { MdEmail, MdPersonAdd } from 'react-icons/md';

const RegisterUser = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem("role");
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    
    const [formData, setFormData] = useState({
        Email: "",
        ConfirmEmail: "",
        empId: "",
        designation: ""
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState({});

    // Redirect if not admin
    useEffect(() => {
        if (role !== "admin") {
            navigate("/home");
        }
    }, [role, navigate]);

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    // Validate form fields
    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'Email':
                if (!value) {
                    error = 'Email is required';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = 'Email is invalid';
                }
                break;
                
            case 'ConfirmEmail':
                if (!value) {
                    error = 'Please confirm your email';
                } else if (value !== formData.Email) {
                    error = 'Emails do not match';
                }
                break;
                
            case 'empId':
                if (!value) {
                    error = 'Employee ID is required';
                } else if (value.length < 3) {
                    error = 'Employee ID must be at least 3 characters';
                }
                break;
                
            case 'designation':
                if (!value) {
                    error = 'Designation is required';
                } else if (value.length < 2) {
                    error = 'Designation must be at least 2 characters';
                }
                break;
                
            default:
                break;
        }
        
        return error;
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Validate on change
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Handle blur event
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        // Validate on blur
        const error = validateField(name, formData[name]);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Validate entire form
    const validateForm = () => {
        const newErrors = {};
        
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });
        
        setErrors(newErrors);
        setTouched({
            Email: true,
            ConfirmEmail: true,
            empId: true,
            designation: true
        });
        
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix all errors before submitting");
            return;
        }

        if (formData.Email !== formData.ConfirmEmail) {
            toast.error("Confirm Email is not the same as Email");
            return;
        }

        const postData = {
            email: formData.Email,
            empId: formData.empId,
            designation: formData.designation
        };

        let loadingToast;
        setIsLoading(true);

        try {
            loadingToast = toast.loading("Registration in progress...");

            const res = await axios.post(`${BASE_URL}/users/register`, postData, { headers });

            if (res.data.success === true) {
                toast.dismiss(loadingToast);
                toast.success("Registration successful!");
                
                // Reset form
                setFormData({
                    Email: "",
                    ConfirmEmail: "",
                    empId: "",
                    designation: ""
                });
                setErrors({});
                setTouched({});
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            const errorMessage = err.response?.data?.message || "Something went wrong during registration";
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/home");
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
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
                        Register <span className="text-[#8BD005]">Employee</span>
                    </h1>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header linear */}
                    <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#8BD005] rounded-full flex items-center justify-center">
                                <MdPersonAdd className="text-white text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">New Employee Registration</h2>
                                <p className="text-gray-300 text-sm">Fill in the details to register a new employee</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200 ${
                                            touched.Email && errors.Email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter employee email"
                                        disabled={isLoading}
                                    />
                                </div>
                                {touched.Email && errors.Email && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle />
                                        {errors.Email}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FaCheckCircle className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="email"
                                        name="ConfirmEmail"
                                        value={formData.ConfirmEmail}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200 ${
                                            touched.ConfirmEmail && errors.ConfirmEmail ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Confirm employee email"
                                        disabled={isLoading}
                                    />
                                </div>
                                {touched.ConfirmEmail && errors.ConfirmEmail && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle />
                                        {errors.ConfirmEmail}
                                    </p>
                                )}
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
                                        name="empId"
                                        value={formData.empId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200 ${
                                            touched.empId && errors.empId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter employee ID (e.g., EMP001)"
                                        disabled={isLoading}
                                    />
                                </div>
                                {touched.empId && errors.empId && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle />
                                        {errors.empId}
                                    </p>
                                )}
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
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200 ${
                                            touched.designation && errors.designation ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter designation (e.g., Software Developer)"
                                        disabled={isLoading}
                                    />
                                </div>
                                {touched.designation && errors.designation && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle />
                                        {errors.designation}
                                    </p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-[#1B2749] to-[#8BD005] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-102 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <FaUserPlus />
                                            Register Employee
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300"
                                    disabled={isLoading}
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
                        <MdEmail className="text-blue-500 mt-0.5 shrink-0" size={20} />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">Registration Information</h3>
                            <p className="text-xs text-blue-700 mt-1">
                                A welcome email will be sent to the registered email address with login credentials.
                                The employee will need to change their password on first login.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Summary Card */}
                {Object.values(formData).some(value => value) && (
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Form Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {formData.Email && (
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-gray-400" size={14} />
                                    <span className="text-gray-600">{formData.Email}</span>
                                </div>
                            )}
                            {formData.empId && (
                                <div className="flex items-center gap-2">
                                    <FaIdCard className="text-gray-400" size={14} />
                                    <span className="text-gray-600">{formData.empId}</span>
                                </div>
                            )}
                            {formData.designation && (
                                <div className="flex items-center gap-2">
                                    <FaBriefcase className="text-gray-400" size={14} />
                                    <span className="text-gray-600">{formData.designation}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterUser;