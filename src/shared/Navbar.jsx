import React, { useEffect, useState, useRef } from 'react'
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { IoClose } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { MdOutlinePeople, MdOutlineAssignment, MdOutlinePersonAdd, MdOutlineAssistantPhoto, 
         MdOutlineFestival, MdOutlineAddCircle, MdOutlineListAlt, MdOutlineAddBox, 
         MdOutlineDeleteOutline, 
         MdOutlineCheckCircle, MdOutlineCalendarToday, MdOutlineUpdate} from "react-icons/md";
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const [time, setTime] = useState(new Date());
    const [date, setDate] = useState(new Date());
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const profileRef = useRef(null);
    const sidebarRef = useRef(null);

    // Get user data from localStorage
    const userName = localStorage.getItem('name') || 'User';
    const userDp = localStorage.getItem('dp');
    const userRole = localStorage.getItem('role');
    const userEmpId = "DCS 001"; // You might want to store this in localStorage too

    useEffect(() => {
        const timeInterval = setInterval(() => setTime(new Date()), 1000);
        const dateInterval = setInterval(() => setDate(new Date()), 60000);
        
        return () => {
            clearInterval(timeInterval);
            clearInterval(dateInterval);
        };
    }, []);

    // Close profile modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            setIsProfileOpen(false);
            navigate('/login');
            // toast.success('Logged out successfully');
        } catch (error) {
            // toast.error('Error logging out');
        }
    };

    const sidebarLinks = [
        { name: 'Timesheet', icon: <MdOutlineAssignment size={20} />, path: '/timesheet' },
        { name: 'Check In/Out', icon: <MdOutlineCheckCircle size={20} />, path: '/attendance' },
        { name: 'Apply Leave', icon: <MdOutlineCalendarToday size={20} />, path: '/apply_leave' },
        { name: 'Update User', icon: <MdOutlineUpdate size={20} />, path: '/update_user' },
        { name: 'Holiday List', icon: <MdOutlineFestival size={20} />, path: '/holiday-list' },
    ];

    const adminSidebarLinks = [
        {name: "Employee List", icon: <MdOutlinePeople size={20} />, path: '/admin/home'},
        {name: "Attendance", icon: <MdOutlineAssignment size={20} />, path: '/admin/attendance'},
        {name: "Register New Employee", icon: <MdOutlinePersonAdd size={20} />, path: '/admin/register'},
        {name: "Leave Applications", icon: <MdOutlineAssistantPhoto size={20} />, path: '/admin/leave_application'},
        {name: "Holiday List", icon: <MdOutlineFestival size={20} />, path: '/admin/holiday-list'},
        {name: "Add Holiday", icon: <MdOutlineAddCircle size={20} />, path: '/admin/add-holiday'},
        {name: "Project List", icon: <MdOutlineListAlt size={20} />, path: '/admin/project-list'},
        {name: "Add Project", icon: <MdOutlineAddBox size={20} />, path: '/admin/add-project'},
        {name: "Deleted Employees", icon: <MdOutlineDeleteOutline size={20} />, path: '/admin/deleted-emps'},
    ]

    if(!user) return null;

    return (
        <>
            {/* Navbar */}
            <div className='w-full flex items-center justify-between p-2 px-4 md:px-8 bg-[#1B2749] relative z-50'>
                <div className='flex items-center gap-2 md:gap-4'>
                    <div 
                        className='text-white cursor-pointer hover:bg-[#2a3a5e] p-2 rounded-lg transition-all duration-300'
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <GiHamburgerMenu size={28} />
                    </div>
                    <a href='https://dayacs.com/' target='_blank' rel='noopener noreferrer'>
                        <img src="/dayalogo.png" alt="dayacslogo" className='w-32 md:w-40 h-10 md:h-14' />
                    </a>
                    <div className="text-white hidden sm:block">
                        <p className='text-[#8BD005] font-semibold text-sm md:text-base'>{time.toLocaleTimeString()}</p>
                        <p className='text-[#8BD005] font-semibold text-sm md:text-base'>{date.toLocaleDateString()}</p>
                    </div>
                </div>

                <div className='flex items-center gap-4 md:gap-6'>
                    <Link to={`${userRole === "emp" ? "/home":"/admin/home"}`} className='text-white hover:text-[#8BD005] transition-colors duration-300 text-sm md:text-base'>
                        Home
                    </Link>
                    {userRole === "emp" ? (
                        <>
                            <Link to='/CEOContent' className='text-white hover:text-[#8BD005] transition-colors duration-300 text-sm md:text-base'>
                                CEO Content
                            </Link>
                            <div 
                                className='text-white cursor-pointer relative'
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                {userDp ? (
                                    <img 
                                        src={userDp} 
                                        alt="profile" 
                                        className='w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-[#8BD005] hover:scale-105 transition-transform duration-300'
                                    />
                                ) : (
                                    <CgProfile size={32} className='hover:text-[#8BD005] transition-colors duration-300' />
                                )}
                            </div>
                        </>
                    ):(
                        <>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-linear-to-r from-red-500 to-red-600 text-white py-2 px-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium transform hover:scale-[1.02] cursor-pointer"
                            >
                                <FiLogOut size={20} />
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            {isProfileOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-end p-4 z-100">
                    <div 
                        ref={profileRef}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-slideIn"
                    >
                        {/* Modal Header */}
                        <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Profile Details</h2>
                                <button 
                                    onClick={() => setIsProfileOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <IoClose size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-6">
                            <div className="flex flex-col items-center mb-6">
                                {userDp ? (
                                    <img 
                                        src={userDp} 
                                        alt={userName}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-[#8BD005] shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-linear-to-r from-[#1B2749] to-[#8BD005] flex items-center justify-center text-white text-3xl font-bold border-4 border-[#8BD005]">
                                        {userName?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <h3 className="mt-4 text-xl font-semibold text-gray-800">{userName}</h3>
                                <p className="text-[#8BD005] font-medium">{userRole==="emp" ? "Employee" : "Admin"}</p>
                            </div>

                            <div className="space-y-3 border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-gray-600 font-medium w-24">Employee ID:</span>
                                    <span className="text-gray-800">{userEmpId}</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-gray-600 font-medium w-24">Email:</span>
                                    <span className="text-gray-800">{user?.email || 'user@example.com'}</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-gray-600 font-medium w-24">Designation:</span>
                                    <span className="text-gray-800">Software Developer</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-gray-600 font-medium w-24">Projects:</span>
                                    <span className="text-gray-800">2 Active</span>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full mt-6 bg-linear-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium transform hover:scale-[1.02]"
                            >
                                <FiLogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-100">
                    <div 
                        ref={sidebarRef}
                        className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl transform transition-all duration-300 animate-slideFromLeft flex flex-col"
                    >
                        {/* Sidebar Header - Fixed at top */}
                        <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-6 shrink-0">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">{userRole === "emp" ? "Menu" : "Admin Dashboard"}</h2>
                                <button 
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <IoClose size={24} />
                                </button>
                            </div>
                            {
                                userRole === "emp" && (
                                    <div className="mt-4 flex items-center gap-3">
                                        {userDp ? (
                                            <img src={userDp} alt={userName} className="w-10 h-10 rounded-full border-2 border-[#8BD005]" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#8BD005] flex items-center justify-center text-white font-bold">
                                                {userName?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white font-medium">{userName}</p>
                                            <p className="text-[#8BD005] text-sm">{userRole == "emp" && "Employee"}</p>
                                        </div>
                                    </div>
                                )
                            }
                        </div>

                        {/* Sidebar Links - Scrollable area */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="px-4">
                                {userRole === "emp" && sidebarLinks.map((link, index) => (
                                    <Link
                                        key={index}
                                        to={link.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="flex items-center gap-3 p-3 mb-2 text-gray-700 hover:bg-[#1B2749] hover:text-white rounded-lg transition-all duration-300 group"
                                    >
                                        <span className="text-[#1B2749] group-hover:text-[#8BD005] transition-colors">
                                            {link.icon}
                                        </span>
                                        <span className="font-medium">{link.name}</span>
                                    </Link>
                                ))}
                                {
                                userRole === "admin" &&  adminSidebarLinks.map((link, index) => (
                                        <Link
                                            key={index}
                                            to={link.path}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="flex items-center gap-3 p-3 mb-2 text-gray-700 hover:bg-[#1B2749] hover:text-white rounded-lg transition-all duration-300 group"
                                        >
                                            <span className="text-[#1B2749] group-hover:text-[#8BD005] transition-colors">
                                                {link.icon}
                                            </span>
                                            <span className="font-medium">{link.name}</span>
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Sidebar Footer - Fixed at bottom */}
                        <div className="shrink-0 p-4 border-t border-gray-200 bg-white">
                            <div className="text-xs text-gray-500 text-center">
                                <p>Employee Management System</p>
                                <p className="mt-1">Version 2.5.3</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style jsx="true">{`
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
                
                @keyframes slideFromLeft {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                
                .animate-slideFromLeft {
                    animation: slideFromLeft 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default Navbar;