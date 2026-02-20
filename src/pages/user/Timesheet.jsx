import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { FaArrowLeft, FaArrowRight, FaSearch, FaTrash, FaDownload, FaPlus, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { MdOutlineWork, MdOutlineWorkOutline, MdDelete, MdEdit } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HiOutlineRefresh } from 'react-icons/hi';
import Holiday from './Holiday';
import { toast } from 'react-toastify';

const Timesheet = () => {
    const {logout, errorHandleLogout} = useAuth();
    const navigate = useNavigate();
    const [refresh, setRefresh] = useState(0);
    const [startingDate, setStartingDate] = useState(null);
    const [endingDate, setEndingDate] = useState(null);
    const [weelyTotals, SetWeeklyTotals] = useState([]);
    const [admin, setAdmin] = useState(false);
    const [isOk, setIsOk] = useState(false);
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const role = localStorage.getItem("role");
    useEffect(() => {
        if (role === "admin") setAdmin(true);
    }, []);
    let userId;
    if (admin) userId = localStorage.getItem("adminSetUser");
    else userId = localStorage.getItem("userId");
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const presentdate = new Date();
    const datevalue = presentdate.toISOString().split("T")[0];
    const [formValue, setFormValue] = useState({
        dte: datevalue,
        project_name: "",
        project_id: "",
        search_name: "",
        workInProgress: "",
        workCompleted: "",
        HoursWorked: "",
        work: [],
        timeSheetId: "",
        dateData: "",
        leave: "",
        isHalfDay: "",
    });
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [currentDate, setCurrentDAte] = useState(new Date());
    const [showForm, setShowFrom] = useState(false);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${BASE_URL}/users/profile?userId=${userId}`,
                    { headers: headers }
                );
                // console.log("response of profile", res.data.user.projects);

                if (res.data.user.projects) {
                    // Filter out objects where projectId is not null
                    const filteredProjects = res.data.user.projects.filter(
                        (project) => project.projectId !== null
                    );
                    // Create an array of projectIds
                    const projectIds = filteredProjects.map((project) => project.projectId);
                    setOptions(projectIds);
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                toast.error("Unable to fetch projects. Please try again.");
                // Handle logout if necessary
                // errorHandleLogout();
            }
        };

        fetchData();
    }, []);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState(options);
    const [work, setWork] = useState([]);
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filteredResults = options.filter(
            (item) =>
                (item.name && item.name.toLowerCase().includes(query)) ||
                (item.code && item.code.toLowerCase().includes(query))
        );

        setFilteredData(filteredResults);
    };
    const handleProjectClick = (project) => {
        setFormValue((prevFormValue) => ({
            ...prevFormValue,
            project_name: project.name,
            project_id: project._id,
            // Update other fields based on your requirement
        }));
        setSearchQuery("");
    };
    const handleAddWork = () => {
        // Validation: Check if any field is missing
        if (!formValue.project_name || !formValue.workCompleted || !formValue.workInProgress || !formValue.HoursWorked) {
            // console.log("Validation failed: All fields are required for adding work.");
            toast.error("Please fill out all fields before adding work.");
            return;
        }
    
        // Proceed with original functionality
        setIsOk(true);
    
        const newWork = {
            project: formValue.project_id,
            completedTask: formValue.workCompleted,
            inProgressTask: formValue.workInProgress,
            hoursWorked: parseFloat(formValue.HoursWorked), // Make sure hoursWorked is a number
        };
    
        // Use functional update to ensure you're appending to the latest work array
        setWork((prevWork) => {
            const updatedWork = [...prevWork, newWork]; // Add the new task to the work array
            
            // Sum up the total hours worked so far
            const totalHours = updatedWork.reduce((acc, task) => acc + (task.hoursWorked || 0), 0);
            
            // Update the total HoursWorked in formValue or a separate state
            setFormValue((prevFormValue) => ({
                ...prevFormValue,
                HoursWorked: totalHours, // Update total hours worked
            }));;
            return updatedWork;
        });
    
        // Clear the work-related fields after adding work
        setFormValue((prevFormValue) => ({
            ...prevFormValue,
            project_name: "",
            workInProgress: "",
            workCompleted: "",
            project_id: "",
            HoursWorked: "", // Clear individual hours input
        }));
        toast.success("Work Added Successfully, Submit to save details!");
    };
    const handleDeleteLeave = async (value) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this approved leave?"
        );
        if (confirmDelete) {
            try {
                await axios
                    .delete(
                        `${BASE_URL}/users/leave/change_leave_to_work?timesheetId=${value}`,
                        { headers: headers }
                    )
                    .then((res) => {
                        // console.log(res);
                        setRefresh(refresh + 1);
                        toast.success(res.data.message);
                        window.location.reload();
                    });

                // Optionally, you can perform additional actions after successful deletion
            } catch (error) {
                console.error(error);
                // Handle error if deletion fails
            }
        }
    };
    const changeMonth = (amount) => {
        const newDate = new Date(year, month - 1 + amount, 1);
        setYear(newDate.getFullYear());
        setMonth(newDate.getMonth() + 1);
    };
    const Calendar = (year, month) => {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        const calendarData = [];

        // Fill in the dates for the previous month
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const lastDayPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const date = lastDayPrevMonth - i;
            const dateString = `${prevYear}-${prevMonth.toString().padStart(2, "0")}-${date
                .toString()
                .padStart(2, "0")}`;
            calendarData.push({
                date,
                month: prevMonth,
                year: prevYear,
                project_name: null,
                workInProgress: null,
                workCompleted: null,
                hoursWorked: null,
                work: [],
                timeSheetId: null,
                dateData: dateString,
                leave: null,
                isHalfDay: null,
            });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${month.toString().padStart(2, "0")}-${day
                .toString()
                .padStart(2, "0")}`;
            calendarData.push({
                date: day,
                month: month,
                year: year,
                project_name: null,
                workInProgress: null,
                workCompleted: null,
                hoursWorked: null,
                work: [],
                timeSheetId: null,
                dateData: dateString,
                leave: null,
                isHalfDay: null,
            });
        }
        return calendarData;
    };
    const [calenderData, setCalenderData] = useState(Calendar(year, month));
    const formatStartingDate = (year, month, day) => {
        // Ensure the month and day are formatted as two digits
        const formattedMonth = month.toString().padStart(2, "0");
        const formattedDay = day.toString().padStart(2, "0");

        return `${year}-${formattedMonth}-${formattedDay}`;
    };
    useEffect(() => {
        setStartingDate(
            formatStartingDate(calenderData[0].year, calenderData[0].month, calenderData[0].date)
        );
    }, [calenderData[0].year, calenderData[0].month, calenderData[0].date]);
    const formatEndingDate = (year, month, day) => {
        // Ensure the month and day are formatted as two digits
        const formattedMonth = month.toString().padStart(2, "0");
        const formattedDay = day.toString().padStart(2, "0");

        return `${year}-${formattedMonth}-${formattedDay}`;
    };
    useEffect(() => {
        setEndingDate(
            formatEndingDate(
                year,
                calenderData[calenderData.length - 1].month,
                calenderData[calenderData.length - 1].date
            )
        );
    }, [
        year,
        calenderData[calenderData.length - 1].month,
        calenderData[calenderData.length - 1].date,
    ]);
    useEffect(() => {
        setCalenderData(Calendar(year, month));
    }, [year, month]);
    const [apiDatas, setApiDatas] = useState([]);
    useEffect(() => {
        if (startingDate && endingDate) {
            try {
                const fetchData = async () => {
                    const res = await axios.get(
                        `${BASE_URL}/users/time_sheet/get_data_range?userId=${userId}&startDate=${startingDate}&endDate=${endingDate}`,
                        { headers: headers }
                    );
                    if (res.data.success) {
                        setApiDatas(res.data.data);
                    } else {
                        toast.error(`${res.data.message}`);
                    }
                };
                if (userId) {
                    fetchData();
                }
            } catch (err) {
                toast.error("Session Timeout");
                handelSignOut();
            }
        }
    }, [startingDate, endingDate, refresh, userId]);
    useEffect(() => {
        // Function to match and update calendarData based on API data
        function updateCalendarData(apiDatas, calenderData) {
            for (let apiEntry of apiDatas) {
                const apiDate = new Date(apiEntry.dte);
                const apiYear = apiDate.getUTCFullYear();
                const apiMonth = apiDate.getUTCMonth() + 1; // Months are zero-based
                const apiDay = apiDate.getUTCDate();

                for (let i = 0; i < calenderData.length; i++) {
                    const calendarEntry = calenderData[i];
                    if (
                        calendarEntry.date === apiDay &&
                        calendarEntry.month === apiMonth &&
                        calendarEntry.year === apiYear
                    ) {
                        // Update calenderData with corresponding API data
                        calendarEntry.hoursWorked = apiEntry.HoursWorked;
                        calendarEntry.workCompleted = apiEntry.workCompleted;
                        calendarEntry.work = apiEntry.work;
                        calendarEntry.timeSheetId = apiEntry._id;
                        calendarEntry.leave = apiEntry.leave;
                        calendarEntry.isHalfDay = apiEntry.isHalfDay;
                        // Add more updates as needed

                        break; // Stop the loop once the match is found
                    }
                }
            }
        }

        // Call the function to update calenderData
        updateCalendarData(apiDatas, calenderData);
        // Assuming you have a function to set calenderData
        setCalenderData([...calenderData]);
    }, [apiDatas, refresh, setApiDatas]);
    const [showLeft, setShowLeft] = useState(true);
    const handleShowPrevData = (i) => {
        setShowLeft(false);
        const { year, month, date } = calenderData[i];
        const dte = new Date(year, month - 1, date);
        if (calenderData[i].hoursWorked) {
            setFormValue({
                ...formValue,
                dte: dte,
                project_name: calenderData[i].project_name,
                workInProgress: calenderData[i].workInProgress,
                workCompleted: calenderData[i].workCompleted,
                HoursWorked: calenderData[i].hoursWorked,
                work: calenderData[i].work,
                timeSheetId: calenderData[i].timeSheetId,
                dateData: calenderData[i].dateData,
                leave: calenderData[i].leave,
                isHalfDay: calenderData[i].isHalfDay,
            });
        } else {
            setFormValue({
                ...formValue,
                dte: dte,
                project_name: "",
                workInProgress: "",
                workCompleted: "",
                HoursWorked: "",
                work: calenderData[i].work,
                timeSheetId: calenderData[i].timeSheetId,
                dateData: calenderData[i].dateData,
                leave: calenderData[i].leave,
                isHalfDay: calenderData[i].isHalfDay,
            });
        }
    };
    useEffect(() => {
        handleUndefined();
    }, []);
    const handleUndefined = () => {
        if (!userId) {
            toast.error("Session Timeout");
            localStorage.removeItem("token");
            navigate("/");
        }
    };
    const timesheetForm = async (postData) => {
        // Validation: Check if work array and required fields are valid
        if (!postData.work || postData.work.length === 0) {
            toast.error("Please add at least one work task before submitting.");
            return;
        }
    
        if (!postData.dte || !postData.HoursWorked) {
            // console.log("Validation failed: Date or HoursWorked is missing.");
            toast.error("Date and total hours worked are required.");
            return;
        }
    
        try {
            handleUndefined();
            const res = await axios.post(`${BASE_URL}/users/time_sheet/create?userId=${userId}`, postData, {
                headers: headers,
            });
    
            // console.log("Success in timesheetForm:", res.data);
            toast.success(`${res.data.message}`);
    
            setFormValue({
                dte: datevalue,
                project_name: "",
                project_id: "",
                search_name: "",
                workInProgress: "",
                workCompleted: "",
                HoursWorked: "",
            });
            setWork([]);
            setRefresh((prev) => prev + 1);
            setIsOk(false);
        } catch (err) {
            // console.log("Error in timesheetForm:", err);
            toast.error("Something Went Wrong");
        }
    };
    const handelSubmit = (e) => {
        e.preventDefault();
    
        // Validation: Check if work and required fields are valid
        if (!work || work.length === 0) {
            toast.error("Please add at least one work task before submitting.");
            return;
        }
    
        if (!formValue.dte || !formValue.HoursWorked) {
            toast.error("Date and total hours worked are required.");
            return;
        }    
        const postData = {
            dte: formValue.dte,
            HoursWorked: formValue.HoursWorked, // This now holds the total hours
            work: work, // Send the full work array
        };
        timesheetForm(postData); // Send the postData to the backend
    };
    const handelHoliday = () => {
        setShowFrom(true);
    };
    const handelDownload = () => {
        const ws = XLSX.utils.table_to_sheet(document.querySelector(".calender-table"));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `timesheet_${year}_${month}.xlsx`);
    };
    //Function to calculate weekly totals
    const calculateWeeklyTotals = () => {
        const newWeeklyTotals = [];

        for (let i = 0; i < calenderData.length; i += 7) {
            const weekTotal = calenderData
                .slice(i, i + 7)
                .reduce((total, calData) => total + (parseFloat(calData.hoursWorked) || 0), 0);
            newWeeklyTotals.push(weekTotal);
        }
        SetWeeklyTotals(newWeeklyTotals);
    };
    useEffect(() => {
        calculateWeeklyTotals();
    }, [calenderData]);
    //for projectname onclick
    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setFormValue({ ...formValue, project_name: [inputValue] });
    };
    const [holidays, setHolidays] = useState([]);
    useEffect(() => {
        try {
            const fetchData = async () => {
                await axios
                    .get(
                        `${BASE_URL}/holiday/get_holidays?startDate=${startingDate}&endDate=${endingDate}`,
                        { headers: headers }
                    )
                    .then((res) => {
                        // console.log("holiday leave list :", res);
                        // console.log("holiday leave list :",res.data.data);
                        setHolidays(res.data.data);
                    })
                    .catch((err) => {
                        // Use parentheses instead of curly braces
                        // console.error("holiday error",err.response.data);
                        // toast.error(`${err.response.data.message}`,{
                        //   position: 'top-right',
                        //   style: {
                        //     marginTop: '62px',
                        //   }
                        // })
                    });
            };
            if (startingDate) fetchData();
        } catch (err) {
            // console.log("response holiday", err);
        }
    }, [startingDate, endingDate]);
    const [arrayData, setArrayData] = useState([]);
    const [allValidDates, setAllValidDates] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            await axios
                .get(
                    `${BASE_URL}/users/leave/view_particular_leaves?status=approved&userId=${userId}`,
                    { headers: headers }
                )
                .then((res) => {
                    // console.log("applyLeave all data", res.data.data);
                    setArrayData(res.data.data);
                })
                .catch((err) => {
                    toast.error("Leave not found");
                });
        };
        fetchData();
    }, [userId, refresh]);

    useEffect(() => {
        if (arrayData) {
            const dates = arrayData.reduce((acc, curr) => {
                return acc.concat(curr.validDates);
            }, []);

            setAllValidDates(dates);
        }
    }, [arrayData]);
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">    
            {/* Right Content - Calendar Section */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FaArrowLeft className="text-gray-600" />
                        </button>
                        <span className="text-xl font-semibold text-gray-800">
                            {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button 
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FaArrowRight className="text-gray-600" />
                        </button>
                    </div>
                    
                    {/* Download Button */}
                    <button 
                        onClick={handelDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1B2749] text-white rounded-lg hover:bg-[#2a3a5e] transition-colors"
                    >
                        <FaDownload size={16} />
                        <span className="hidden sm:inline">Download</span>
                    </button>
                </div>

                {/* Calendar Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <th key={day} className="p-3 text-sm font-semibold text-gray-700 border">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.ceil(calenderData.length / 7) }).map((_, weekIndex) => (
                                <tr key={weekIndex}>
                                    {calenderData.slice(weekIndex * 7, (weekIndex + 1) * 7).map((calData, index) => {
                                        const isHoliday = holidays.find((holiday) => {
                                            const holidayDate = new Date(holiday.dte).getDate();
                                            const holidayMonth = new Date(holiday.dte).getMonth() + 1;
                                            return calData.date === holidayDate && calData.month === holidayMonth;
                                        });

                                        const currentDate = new Date();
                                        const currentDay = currentDate.getDate();
                                        const currentMonth = currentDate.getMonth() + 1;
                                        const currentYear = currentDate.getFullYear();

                                        const isDateBeforePresent = () => {
                                            return (
                                                currentYear > calData.year ||
                                                (currentYear === calData.year && currentMonth > calData.month) ||
                                                (currentYear === calData.year && currentMonth === calData.month && currentDay > calData.date)
                                            );
                                        };

                                        // Determine cell style
                                        let cellStyle = "border p-3 text-center cursor-pointer transition-all hover:shadow-inner ";
                                        
                                        if (calData.isHalfDay === true) {
                                            cellStyle += calData.work && calData.work.length > 0 
                                                ? "bg-gradient-to-br from-green-100 to-purple-100" 
                                                : "bg-gradient-to-br from-red-100 to-purple-100";
                                        } else if (calData.date === currentDay && calData.month === currentMonth) {
                                            cellStyle += "bg-blue-100 border-2 border-blue-500";
                                        } else if (calData.leave === true) {
                                            cellStyle += "bg-purple-200";
                                        } else if ((index % 7 === 0 || isHoliday) && !calData.hoursWorked) {
                                            cellStyle += "bg-yellow-100";
                                        } else if (calData.work && calData.work.length > 0) {
                                            cellStyle += "bg-green-100";
                                        } else if (isDateBeforePresent()) {
                                            cellStyle += "bg-red-100";
                                        }

                                        return (
                                            <td
                                                key={`${weekIndex}-${index}`}
                                                onClick={() => handleShowPrevData(weekIndex * 7 + index)}
                                                className={cellStyle}
                                            >
                                                <div className="font-medium">{calData.date}</div>
                                                {calData.hoursWorked && (
                                                    <div className="text-xs mt-1 bg-white/50 rounded px-1">
                                                        {calData.hoursWorked}h
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Weekly Totals */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {weelyTotals.map((total, index) => (
                        <div key={index} className="bg-gray-100 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-500">Week {index + 1}</div>
                            <div className="font-semibold text-[#1B2749]">{total}h</div>
                        </div>
                    ))}
                </div>

                {/* Total Hours */}
                <div className="mt-4 flex justify-end">
                    <div className="bg-[#1B2749] text-white px-6 py-3 rounded-lg">
                        <span className="font-semibold">Total: </span>
                        <span className="text-xl font-bold">
                            {weelyTotals.reduce((total, weekTotal) => total + weekTotal, 0)}h
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Legend</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 rounded"></div>
                            <span className="text-sm">Filled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 rounded"></div>
                            <span className="text-sm">Not Filled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                            <span className="text-sm">Holiday</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-200 rounded"></div>
                            <span className="text-sm">Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-linear-to-br from-green-100 to-purple-100 rounded"></div>
                            <span className="text-sm">Half Day (Filled)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-linear-to-br from-red-100 to-purple-100 rounded"></div>
                            <span className="text-sm">Half Day (Not Filled)</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handelHoliday()}
                        className="mt-4 text-[#8BD005] hover:underline text-sm flex items-center gap-1"
                    >
                        <FaCalendarAlt size={14} />
                        Show Holidays
                    </button>
                </div>
            </div>

            {/* Left Content - Form Section */}
            <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg p-6">
                {showLeft ? (
                    // Form View
                    <div>
                        {admin && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-700 mb-3">Admin View</h2>
                                <button
                                    onClick={() => {
                                        navigate("/admin/home");
                                        localStorage.removeItem("adminSetUser");
                                    }}
                                    className="flex items-center gap-2 text-[#1B2749] hover:text-[#8BD005] transition-colors"
                                >
                                    <FaArrowLeft size={20} />
                                    <span>Back to Admin Dashboard</span>
                                </button>
                            </div>
                        )}

                        <form onSubmit={handelSubmit} className="space-y-5">
                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Date
                                </label>
                                <select
                                    value={formValue.dte}
                                    onChange={(e) => setFormValue({ ...formValue, dte: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                >
                                    {admin
                                        ? calenderData.map((item) => {
                                            const isoDate = `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.date).padStart(2, '0')}`;
                                            return (
                                                <option key={isoDate} value={isoDate}>
                                                    {isoDate}
                                                </option>
                                            );
                                        })
                                        : currentDate.getDate() === calenderData[calenderData.length - 3]?.date
                                        ? [...Array(5)].map((_, index) => {
                                            const offset = index - 2;
                                            const date = new Date();
                                            date.setDate(currentDate.getDate() + offset);
                                            const isoDate = date.toISOString().split('T')[0];
                                            return (
                                                <option key={isoDate} value={isoDate}>
                                                    {isoDate}
                                                </option>
                                            );
                                        })
                                        : [0, 1, 2].map((offset) => {
                                            const date = new Date();
                                            date.setDate(currentDate.getDate() - offset);
                                            const isoDate = date.toISOString().split('T')[0];
                                            return (
                                                <option key={isoDate} value={isoDate}>
                                                    {isoDate}
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>

                            {!admin && (
                                <div className="space-y-4">
                                    {/* Project Search */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search Project
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search by name or code"
                                                value={searchQuery}
                                                onChange={handleSearch}
                                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                            />
                                            <FaSearch className="absolute left-3 top-3 text-gray-400" size={16} />
                                        </div>

                                        {/* Search Results */}
                                        {searchQuery !== "" && filteredData.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredData.map((item) => (
                                                    <div
                                                        key={item.code}
                                                        onClick={() => handleProjectClick(item)}
                                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                    >
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-gray-500">Code: {item.code}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Project Name
                                            </label>
                                            <textarea
                                                value={formValue.project_name}
                                                onChange={handleInputChange}
                                                rows={2}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                                placeholder="Enter project name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Completed Task
                                            </label>
                                            <textarea
                                                value={formValue.workCompleted}
                                                onChange={(e) => setFormValue({ ...formValue, workCompleted: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                                placeholder="Describe completed tasks"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Task in Progress
                                            </label>
                                            <textarea
                                                value={formValue.workInProgress}
                                                onChange={(e) => setFormValue({ ...formValue, workInProgress: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                                placeholder="Describe tasks in progress"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Hours Worked */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hours Worked
                                </label>
                                <input
                                    type="number"
                                    value={formValue.HoursWorked}
                                    onChange={(e) => setFormValue({ ...formValue, HoursWorked: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                    placeholder="Enter hours"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                {!admin && (
                                    <button
                                        type="button"
                                        onClick={handleAddWork}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#8BD005] hover:bg-[#6d971a] text-white rounded-lg transition-colors"
                                    >
                                        <FaPlus size={16} />
                                        Add Work
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#1B2749] hover:bg-[#2a3a5e] text-white rounded-lg transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // Details View
                    <div>
                        <button
                            onClick={() => setShowLeft(true)}
                            className="mb-6 flex items-center gap-2 text-[#1B2749] hover:text-[#8BD005] transition-colors"
                        >
                            <FaArrowLeft size={20} />
                            <span>Back to Form</span>
                        </button>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="text-lg font-semibold text-gray-800">{formValue.dateData}</p>
                            </div>

                            {formValue.leave ? (
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-purple-700 font-medium">Leave approved for this day</p>
                                    {admin && (
                                        <button
                                            onClick={() => handleDeleteLeave(formValue.timeSheetId)}
                                            className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                        >
                                            <FaTrash size={16} />
                                            Delete Leave
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Hours Worked</p>
                                        <p className="text-2xl font-bold text-[#1B2749]">{formValue.HoursWorked}h</p>
                                    </div>

                                    {formValue.work && formValue.work.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-700 mb-3">Work Details</h3>
                                            <div className="space-y-3">
                                                {formValue.work.map((item, index) => (
                                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                        <h4 className="font-medium text-[#1B2749]">
                                                            {item.project?.name || 'Project'}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            <span className="font-medium">Completed:</span> {item.completedTask}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">In Progress:</span> {item.inProgressTask}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Holiday Modal */}
        {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Holidays</h2>
                            <button
                                onClick={() => setShowFrom(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaTimes size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <Holiday
                            setShowFrom={setShowFrom}
                            startingDate={startingDate}
                            endingDate={endingDate}
                        />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default Timesheet
