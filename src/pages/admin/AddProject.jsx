import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiPlus, FiX, FiUserPlus, FiCalendar, FiCode, FiFileText } from 'react-icons/fi'

const roles = [
    "HR Specialist", "HR Manager", "HR Business Partner", "HR Executive", "HR Generalist",
    "HR Recruiter", "Sr HR Recruiter", "Account Manager", "Business Development Manager",
    "Business Partner", "Account Executive", "Project Manager", "Developer", "Sr Developer",
    "Software Developer", "Front End Developer", "Java Developer", "Software Architect",
    "Full Stack Developer", "Web Developer", "Software Engineer", "Freelancer",
    "Internship HR", "Internship IT"
];

const AddProject = () => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [data, setData] = useState([]);
    const [startingDate, setStartingDate] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [teamMembers, setTeamMembers] = useState([]);
    const [finalTeamMember, setFinalTeamMember] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        startingDate: '',
        deadline: '',
        description: {},
        tempKey: '',
        tempValue: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const loadingToast = toast.loading("Loading employee list...");
            
            try {
                const res = await axios.get(`${BASE_URL}/users/get_all_user`, { headers });
                if (res.data) {
                    setData(res.data.users);
                    toast.update(loadingToast, {
                        render: "Employee list loaded!",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000
                    });
                }
            } catch (err) {
                toast.update(loadingToast, {
                    render: err.response?.data?.message || "Failed to load employees",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            startingDate: '',
            deadline: '',
            description: {},
            tempKey: '',
            tempValue: '',
        });
        setTeamMembers([]);
        setFinalTeamMember([]);
        setSelectedRole('');
        setStartingDate('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
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
                    [formData.tempKey]: formData.tempValue,
                },
                tempKey: '',
                tempValue: '',
            }));
            toast.success("Description added!");
        } else {
            toast.error("Please enter both key and value");
        }
    };

    const handleRemoveDescription = (keyToRemove) => {
        const newDescription = { ...formData.description };
        delete newDescription[keyToRemove];
        setFormData(prev => ({
            ...prev,
            description: newDescription
        }));
    };

    const filteredRoles = roles.filter(role =>
        role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddUser = (userId, name) => {
        const selectedUser = data.find((user) => user._id === userId);

        if (!selectedRole) {
            toast.error('Please select a role before adding a user.');
            return;
        }

        if (!startingDate) {
            toast.error("Please fill up the starting date");
            return;
        }

        // Prompt the user for additional information
        const moreInfo = promptForKeyValuePairs();

        const newMember = {
            userId: selectedUser._id,
            role: selectedRole,
            staringDate: startingDate,
            name: name,
            more: moreInfo,
        };

        setTeamMembers((prevTeamMembers) => [...prevTeamMembers, newMember]);
        setFinalTeamMember((prevTeamMembers) => [...prevTeamMembers, newMember]);
        
        // Reset selections after adding
        setSelectedRole('');
        setStartingDate('');
        
        toast.success(`${name} added to team!`);
    };

    const handleRemoveMember = (indexToRemove) => {
        setTeamMembers(prev => prev.filter((_, index) => index !== indexToRemove));
        setFinalTeamMember(prev => prev.filter((_, index) => index !== indexToRemove));
        toast.info("Member removed from team");
    };

    const promptForKeyValuePairs = () => {
        const moreInfo = {};
        let continueAdding = true;

        while (continueAdding) {
            const key = prompt('Enter a key (or cancel to finish):');
            if (key === null) break;
            
            const value = prompt(`Enter value for "${key}":`);
            if (value === null) continue;

            moreInfo[key] = value;

            continueAdding = window.confirm('Do you want to add another key-value pair?');
        }

        return moreInfo;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.code || !formData.startingDate || !formData.deadline) {
            toast.error("Please fill all required fields");
            return;
        }

        const postData = {
            name: formData.name,
            code: formData.code,
            staringDate: formData.startingDate,
            deadline: formData.deadline,
            description: formData.description,
            teamMembers: teamMembers
        };

        const loadingToast = toast.loading("Adding new project...");
        
        try {
            const res = await axios.post(`${BASE_URL}/projects/create`, postData, { headers });
            
            if (res.data) {
                toast.update(loadingToast, {
                    render: "Project created successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });
                resetForm();
            }
        } catch (err) {
            toast.update(loadingToast, {
                render: err.response?.data?.message || "Failed to create project",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Add New Project</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Form */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Project Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                    placeholder="Enter project name"
                                />
                            </div>

                            {/* Project Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                    placeholder="Enter project code"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Starting Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="startingDate"
                                        value={formData.startingDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deadline <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                
                                {/* Existing description fields */}
                                <div className="space-y-2 mb-3">
                                    {Object.entries(formData.description).map(([key, value], index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600 min-w-20">{key}:</span>
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleDescriptionChange(key, e.target.value)}
                                                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8BD005]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDescription(key)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FiX size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add new description field */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={formData.tempKey}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, tempKey: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8BD005]"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={formData.tempValue}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, tempValue: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8BD005]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddDescription}
                                        className="px-4 py-2 bg-[#8BD005] text-white rounded-lg hover:bg-[#6d971a] transition-colors flex items-center gap-1"
                                    >
                                        <FiPlus size={18} />
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Team Member Selection */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Team Members</h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Role
                                        </label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005]"
                                        >
                                            <option value="">Select Role</option>
                                            {filteredRoles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Starting Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startingDate}
                                            onChange={(e) => setStartingDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005]"
                                        />
                                    </div>
                                </div>

                                {/* Selected Team Members List */}
                                {finalTeamMember.length > 0 && (
                                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Members:</h4>
                                        <ul className="space-y-2">
                                            {finalTeamMember.map((member, index) => (
                                                <li key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                                    <div className="flex-1">
                                                        <span className="font-medium text-gray-800">{member.name}</span>
                                                        <span className="text-sm text-gray-600 ml-2">({member.role})</span>
                                                        <span className="text-xs text-gray-500 ml-2">Start: {member.staringDate}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember(index)}
                                                        className="text-red-500 hover:text-red-700 ml-2"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-linear-to-r from-[#1B2749] to-[#2a3a5e] text-white py-3 px-4 rounded-lg hover:from-[#2a3a5e] hover:to-[#1B2749] transition-all duration-300 font-medium transform hover:scale-[1.02]"
                            >
                                Create Project
                            </button>
                        </form>
                    </div>

                    {/* Right Column - Employee List */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Team Members</h2>
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BD005]"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sl no</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Emp Code</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Designation</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Add</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {data.map((item, index) => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.empId}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.designation}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        className="p-2 text-[#8BD005] hover:bg-green-50 rounded-full transition-colors"
                                                        onClick={() => handleAddUser(item._id, item.name)}
                                                        title="Add to team"
                                                    >
                                                        <FiUserPlus size={20} />
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
        </div>
    );
};

export default AddProject;