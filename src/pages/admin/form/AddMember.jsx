import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../../contexts/AuthContext';
import { IoClose } from "react-icons/io5";
import { FaUserPlus, FaSearch, FaCalendarAlt, FaUserTag } from "react-icons/fa";
import { MdOutlineAssignmentInd, MdOutlineDateRange } from "react-icons/md";
import { BiUser, BiIdCard } from "react-icons/bi";

const roles = [
  "HR Specialist", "HR Manager", "HR Business Partner", "HR Executive", "HR Generalist",
  "HR Recruiter", "Sr HR Recruiter", "Account Manager", "Business Development Manager",
  "Business Partner", "Account Executive", "Project Manager", "Developer", "Sr Developer",
  "Software Developer", "Front End Developer", "Java Developer", "Software Architect",
  "Full Stack Developer", "Web Developer", "Software Engineer", "Freelancer",
  "Internship HR", "Internship IT"
];

const AddMember = ({ index, projectLIst, setAddMember, setRefresh, refresh }) => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const { errorHandleLogout } = useAuth();
    const headers = {
        Authorization: `Bearer ${token}`,
    }
    const [data, setData] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [finalTeamMember, setFinalTeamMember] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [startingDate, setStartingDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const loadingToast = toast.loading("Loading employee list...");
            try {
                setIsLoading(true);
                const res = await axios.get(`${BASE_URL}/users/get_all_user`, { headers: headers });
                setData(res.data.users);
                toast.dismiss(loadingToast);
                toast.success(res.data.message);
            } catch (err) {
                toast.dismiss(loadingToast);
                if (err.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                    errorHandleLogout();
                } else {
                    toast.error(err.response?.data?.message || "Failed to fetch employees");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredRoles = roles.filter(role =>
        role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = data.filter(user =>
        user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.empId?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.designation?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const handleAddUser = (userId, name) => {
        const selectedUser = data.find((user) => user._id === userId);
        
        if (!selectedRole) {
            toast.warn('Please select a role before adding a user.');
            return;
        }
        if (!startingDate) {
            toast.warn("Please select a starting date");
            return;
        }

        // Prompt the user for additional information
        const moreInfo = promptForKeyValuePairs();
        if (!moreInfo) return;

        const newMember = {
            userId: selectedUser._id,
            role: selectedRole,
            staringDate: startingDate,
            name: name,
            more: moreInfo,
        };

        setTeamMembers((prev) => [...prev, newMember]);
        setFinalTeamMember((prev) => [...prev, newMember]);
        setSelectedRole('');
        setStartingDate('');
        toast.success(`${name} added to team`);
    };

    const promptForKeyValuePairs = () => {
        const moreInfo = {};
        let continueAdding = true;

        while (continueAdding) {
            const key = prompt('Enter key (e.g., workDescription, skills, etc.):');
            if (!key) break;
            
            const value = prompt(`Enter value for "${key}":`);
            if (!value) break;

            moreInfo[key] = value;
            continueAdding = window.confirm('Add another field?');
        }

        return Object.keys(moreInfo).length > 0 ? moreInfo : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (teamMembers.length === 0) {
            toast.warn("Please add at least one team member");
            return;
        }

        const postData = { teamMembers: teamMembers };
        const loadingToast = toast.loading("Adding new members...");
        setIsSubmitting(true);

        try {
            const res = await axios.patch(
                `${BASE_URL}/projects/add_members?projectId=${projectLIst[index]._id}`,
                postData,
                { headers: headers }
            );
            
            toast.dismiss(loadingToast);
            toast.success(res.data.message);
            setRefresh(refresh + 1);
            
            setTimeout(() => {
                setAddMember(false);
            }, 2000);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || "Failed to add members");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeTeamMember = (indexToRemove) => {
        setFinalTeamMember(prev => prev.filter((_, index) => index !== indexToRemove));
        setTeamMembers(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e] p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FaUserPlus className="text-[#8BD005]" />
                        Add Team Members
                    </h2>
                    <button
                        onClick={() => setAddMember(false)}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <IoClose size={28} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Left Column - Form & Current Members */}
                        <div className="space-y-6">
                            {/* Current Members Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <MdOutlineAssignmentInd className="text-[#8BD005]" />
                                    Current Team Members
                                </h3>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {projectLIst[index]?.teamMembers?.length > 0 ? (
                                        projectLIst[index].teamMembers.map((teamMember, tmIndex) => (
                                            <div key={tmIndex} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 block">Role</span>
                                                        <span className="font-medium text-gray-800">{teamMember.role}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block">Start Date</span>
                                                        <span className="font-medium text-gray-800">{new Date(teamMember.staringDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block">Name</span>
                                                        <span className="font-medium text-gray-800">{teamMember.userId?.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block">Emp ID</span>
                                                        <span className="font-medium text-gray-800">{teamMember.userId?.empId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No team members yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Add New Member Form */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Member</h3>
                                
                                <div className="space-y-4">
                                    {/* Role Selection */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Role <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search or select role..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onFocus={() => setShowRoleDropdown(true)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005]"
                                            />
                                        </div>
                                        
                                        {showRoleDropdown && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredRoles.map(role => (
                                                    <div
                                                        key={role}
                                                        onClick={() => {
                                                            setSelectedRole(role);
                                                            setSearchTerm(role);
                                                            setShowRoleDropdown(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-[#8BD005] hover:text-white cursor-pointer transition-colors"
                                                    >
                                                        {role}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Starting Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Starting Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                value={startingDate}
                                                onChange={(e) => setStartingDate(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Team Members Preview */}
                                {finalTeamMember.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-medium text-gray-700 mb-2">New Members to Add:</h4>
                                        <div className="space-y-2">
                                            {finalTeamMember.map((member, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{member.role}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeTeamMember(idx)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <IoClose size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Employee List */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Employee Directory</h3>
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, emp ID, or designation..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005]"
                                    />
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8BD005]"></div>
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-96">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Emp Code</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Designation</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((item, idx) => (
                                                <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.empId}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{item.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{item.designation}</td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleAddUser(item._id, item.name)}
                                                            disabled={isSubmitting}
                                                            className="bg-[#8BD005] hover:bg-[#6d971a] text-white px-3 py-1 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                        >
                                                            <FaUserPlus size={14} />
                                                            Add
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer with Submit Button */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setAddMember(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || teamMembers.length === 0}
                            className="px-6 py-2 bg-[#8BD005] hover:bg-[#6d971a] text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus size={16} />
                                    Add Members
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Animation styles */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AddMember;
