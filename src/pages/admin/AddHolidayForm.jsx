import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiCalendar, FiList } from "react-icons/fi";
import { MdOutlineEventNote } from "react-icons/md";

const AddHolidayForm = () => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    
    const [holidays, setHolidays] = useState([{ name: "", dte: "" }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Redirect if not admin
    useEffect(() => {
        if (role !== "admin") {
            toast.error("Unauthorized access!");
            navigate("/home");
        }
    }, [role, navigate]);

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const handlePlus = () => {
        setHolidays([...holidays, { name: "", dte: "" }]);
        toast.info("New holiday field added");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate at least one holiday is filled
        const isValid = holidays.some(h => h.name.trim() && h.dte);
        if (!isValid) {
            toast.error("Please add at least one holiday with name and date");
            return;
        }

        // Validate all filled holidays have both name and date
        const invalidEntries = holidays.filter(h => (h.name.trim() || h.dte) && (!h.name.trim() || !h.dte));
        if (invalidEntries.length > 0) {
            toast.error("Please fill both name and date for all added holidays");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const res = await axios.post(
                `${BASE_URL}/holiday/add_holiday`,
                { holidayList: holidays.filter(h => h.name.trim() && h.dte) }, // Only send filled holidays
                { headers: headers }
            );
            
            if (res.data.success === true) {
                toast.success(res.data.message || "Holidays added successfully!");
                // Reset form after successful submission
                setHolidays([{ name: "", dte: "" }]);
            } else {
                toast.error(res.data.message || "Failed to add holidays");
            }
        } catch (err) {
            if (err.response) {
                toast.error(err.response.data.message || "Error adding holidays");
                console.error("Error:", err.response.data.message);
            } else {
                toast.error("Network error. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (index, key, value) => {
        const updatedHoliday = [...holidays];
        updatedHoliday[index][key] = value;
        setHolidays(updatedHoliday);
    };

    const handleDelete = (index) => {
        if (holidays.length > 1) {
            setHolidays(holidays.filter((_, i) => i !== index));
            toast.info("Holiday field removed");
        } else {
            // If it's the last field, just clear it instead of deleting
            setHolidays([{ name: "", dte: "" }]);
            toast.info("Field cleared");
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-r from-[#1B2749] to-[#2a3a5e] flex items-center justify-center">
                            <MdOutlineEventNote className="text-white text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                Add Holidays
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Add and manage company holidays for the year
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                    <form onSubmit={handleSubmit}>
                        {/* Holiday Fields */}
                        <div className="space-y-4 mb-6">
                            {holidays.map((holiday, index) => (
                                <div
                                    key={index}
                                    className="relative group animate-fadeIn"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-[#8BD005] transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            {/* Serial Number */}
                                            <div className="w-8 h-8 rounded-full bg-linear-to-r from-[#1B2749] to-[#2a3a5e] text-white flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </div>

                                            {/* Holiday Name Input */}
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <FiList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Enter holiday name"
                                                        value={holiday.name}
                                                        onChange={(e) =>
                                                            handleInputChange(index, "name", e.target.value)
                                                        }
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            </div>

                                            {/* Date Input */}
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="date"
                                                        value={holiday.dte}
                                                        onChange={(e) =>
                                                            handleInputChange(index, "dte", e.target.value)
                                                        }
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent transition-all duration-200"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(index)}
                                                className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                                                    hoveredIndex === index
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-red-100 text-red-500 hover:bg-red-500 hover:text-white'
                                                }`}
                                                disabled={isSubmitting}
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add More Button */}
                        <button
                            type="button"
                            onClick={handlePlus}
                            disabled={isSubmitting}
                            className="w-full mb-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#8BD005] hover:text-[#8BD005] hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <FiPlus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-medium">Add Another Holiday</span>
                        </button>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-linear-to-r from-[#1B2749] to-[#2a3a5e] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:ring-offset-2 ${
                                isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:from-[#2a3a5e] hover:to-[#1B2749]'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                    <span>Adding Holidays...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <MdOutlineEventNote size={24} />
                                    <span>Submit Holidays</span>
                                </div>
                            )}
                        </button>

                        {/* Helper Text */}
                        <p className="text-center text-sm text-gray-500 mt-4">
                            * Only holidays with both name and date will be submitted
                        </p>
                    </form>
                </div>

                {/* Preview Card (Optional) */}
                {holidays.some(h => h.name && h.dte) && (
                    <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-slideUp">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FiList className="text-[#8BD005]" />
                            Holiday Preview
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {holidays.filter(h => h.name && h.dte).map((holiday, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <span className="font-medium text-gray-700">{holiday.name}</span>
                                    <span className="text-sm text-gray-500">{new Date(holiday.dte).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
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
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AddHolidayForm;