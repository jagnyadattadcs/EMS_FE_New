import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaTimes, FaCalendarAlt, FaGift, FaStar, FaMoon } from "react-icons/fa";
import { GiPartyPopper, GiSunrise } from "react-icons/gi";
import { MdOutlineCelebration } from "react-icons/md";

const Holiday = ({ setShowFrom, startingDate, endingDate }) => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    }

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${BASE_URL}/holiday/get_holidays?startDate=${startingDate}&endDate=${endingDate}`, { headers: headers });
                setHolidays(res.data.data);
            } catch (err) {
                toast.error("Error fetching holidays");
                console.error("Error fetching holidays:", err);
            } finally {
                setLoading(false);
            }
        };

        if (startingDate && endingDate) {
            fetchHolidays();
        }
    }, [startingDate, endingDate]);

    const handelHide = () => {
        setShowFrom(false);
    };

    // Function to get random icon for holiday
    const getHolidayIcon = (index) => {
        const icons = [
            <GiPartyPopper className="text-yellow-500" size={24} />,
            <FaGift className="text-red-500" size={24} />,
            <FaStar className="text-yellow-400" size={24} />,
            <GiSunrise className="text-orange-500" size={24} />,
            <FaMoon className="text-indigo-500" size={24} />,
            <MdOutlineCelebration className="text-green-500" size={24} />
        ];
        return icons[index % icons.length];
    };

    // Group holidays by month
    const groupHolidaysByMonth = () => {
        const grouped = {};
        holidays.forEach(holiday => {
            const date = new Date(holiday.dte);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!grouped[monthYear]) {
                grouped[monthYear] = [];
            }
            grouped[monthYear].push(holiday);
        });
        return grouped;
    };

    const groupedHolidays = groupHolidaysByMonth();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-slideIn">
                
                {/* Header */}
                <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FaCalendarAlt className="text-[#8BD005]" size={28} />
                            <h2 className="text-2xl font-bold text-white">Holidays</h2>
                        </div>
                        <button
                            onClick={handelHide}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                            <FaTimes size={20} className="text-white/80 group-hover:text-white" />
                        </button>
                    </div>
                    <p className="text-gray-300 mt-2 text-sm">
                        {startingDate && endingDate && (
                            <>From {new Date(startingDate).toLocaleDateString()} to {new Date(endingDate).toLocaleDateString()}</>
                        )}
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8BD005]"></div>
                            <p className="mt-4 text-gray-500">Loading holidays...</p>
                        </div>
                    ) : holidays.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                <FaCalendarAlt className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Holidays Found</h3>
                            <p className="text-gray-500">There are no holidays in this date range.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedHolidays).map(([monthYear, monthHolidays]) => (
                                <div key={monthYear} className="space-y-3">
                                    <h3 className="text-lg font-semibold text-[#1B2749] border-b border-gray-200 pb-2">
                                        {monthYear}
                                    </h3>
                                    <div className="space-y-3">
                                        {monthHolidays.map((item, index) => {
                                            const holidayDate = new Date(item.dte);
                                            const day = holidayDate.getDate();
                                            const weekday = holidayDate.toLocaleString('default', { weekday: 'short' });
                                            
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group animate-fadeIn"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    {/* Date Box */}
                                                    <div className="shrink-0 w-16 h-16 bg-linear-to-br from-[#1B2749] to-[#2a3a5e] rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                                                        <span className="text-xs opacity-80">{weekday}</span>
                                                        <span className="text-2xl font-bold">{day}</span>
                                                    </div>

                                                    {/* Holiday Icon */}
                                                    <div className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                                                        {getHolidayIcon(index)}
                                                    </div>

                                                    {/* Holiday Details */}
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800 group-hover:text-[#1B2749] transition-colors">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {holidayDate.toLocaleDateString('default', { 
                                                                month: 'long', 
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                        {item.description && (
                                                            <p className="text-sm text-gray-600 mt-2">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Holiday Type Badge */}
                                                    <div className="shrink-0">
                                                        <span className="px-3 py-1 bg-[#8BD005]/20 text-[#6d971a] rounded-full text-xs font-medium">
                                                            Holiday
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Total <span className="font-bold text-[#1B2749]">{holidays.length}</span> holidays found
                        </p>
                        <button
                            onClick={handelHide}
                            className="px-6 py-2 bg-[#1B2749] hover:bg-[#2a3a5e] text-white rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Animation Styles */}
            <style >{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

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

                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }

                .animate-fadeIn {
                    opacity: 0;
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Holiday;