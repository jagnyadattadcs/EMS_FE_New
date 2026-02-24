import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import UpdateProject from "./form/UpdateProject";
import AddMember from "./form/AddMember";
import ChangeProjectStatus from "./form/ChangeProjectStatus";
import UpdateTeamMember from "./form/UpdateTeamMember";
import DeleteTeamMember from "./form/DeleteTeamMember";

// Icons (you can also use react-icons library)
import { 
    FiMoreVertical, 
    FiEdit, 
    FiTrash2, 
    FiDownload, 
    FiX, 
    FiSearch,
    FiUserPlus,
    FiClock,
    FiCheckCircle,
    FiAlertCircle
} from "react-icons/fi";

const ProjectList = () => {
    const [projectList, setProjectList] = useState([]);
    const [index, setIndex] = useState(0);
    const [showComponent, setShowComponent] = useState(false);
    const [showChangeStatus, setShowChangeStatus] = useState(false);
    const [addMember, setAddMember] = useState(false);
    const [showEditMember, setShowEditMember] = useState(false);
    const [showDeleteMember, setShowDeleteMember] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [tmIndex, setTmIndex] = useState(0);
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    // Sort function without lodash
    const sortProjectsByDate = (projects) => {
        return [...projects].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    };

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            const loadingToast = toast.loading("Loading projects...");
            
            try {
                const res = await axios.get(`${BASE_URL}/projects/get_all_project`, { 
                    headers: headers 
                });
                
                if (res.data.success) {
                    const sortedData = sortProjectsByDate(res.data.projects);
                    setProjectList(sortedData);
                    toast.update(loadingToast, {
                        render: "Projects loaded successfully!",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000
                    });
                }
            } catch (err) {
                toast.update(loadingToast, {
                    render: err.response?.data?.message || "Failed to load projects",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [refresh]);

    const handleTeamEdit = (projectIdx, memberIdx) => {
        setShowEditMember(true);
        setIndex(projectIdx);
        setTmIndex(memberIdx);
        setSelectedProject(projectList[projectIdx]);
    };

    const handleTeamDelete = (projectIdx, memberIdx) => {
        setShowDeleteMember(true);
        setIndex(projectIdx);
        setTmIndex(memberIdx);
        setSelectedProject(projectList[projectIdx]);
    };

    const handleEdit = (projectIdx) => {
        setShowComponent(true);
        setIndex(projectIdx);
        setSelectedProject(projectList[projectIdx]);
        setOpenDropdownIndex(null);
    };

    const handleChangeStatus = (projectIdx) => {
        setShowChangeStatus(true);
        setIndex(projectIdx);
        setSelectedProject(projectList[projectIdx]);
        setOpenDropdownIndex(null);
    };

    const handleAddMember = (projectIdx) => {
        setAddMember(true);
        setIndex(projectIdx);
        setSelectedProject(projectList[projectIdx]);
        setOpenDropdownIndex(null);
    };

    const handleDropdownClick = (idx) => {
        setOpenDropdownIndex(openDropdownIndex === idx ? null : idx);
    };

    // Filter function without lodash
    const filterProjects = (projects) => {
        if (!searchTerm.trim()) return projects;
        
        return projects.filter(project => {
            const searchLower = searchTerm.toLowerCase();
            return (
                project.code?.toLowerCase().includes(searchLower) ||
                project.name?.toLowerCase().includes(searchLower) ||
                project.status?.toLowerCase().includes(searchLower)
            );
        });
    };

    const filteredProjects = filterProjects(projectList);

    const handleDownloadLogFile = async (projectIdx) => {
        setOpenDropdownIndex(null);
        const project = projectList[projectIdx];
        
        const confirmDownload = window.confirm("Download log file for this project?");
        if (!confirmDownload) return;

        const loadingToast = toast.loading("Downloading log file...");
        
        try {
            const res = await axios.get(`${BASE_URL}/projects/log?projectId=${project._id}`, 
                { headers, responseType: 'blob' }
            );
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `project_${project.code}_log.txt`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.update(loadingToast, {
                render: "Log file downloaded successfully!",
                type: "success",
                isLoading: false,
                autoClose: 2000
            });
        } catch (err) {
            toast.update(loadingToast, {
                render: err.response?.data?.message || "Download failed",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    const handleDeleteProject = async (projectIdx) => {
        setOpenDropdownIndex(null);
        const project = projectList[projectIdx];
        
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (!confirmDelete) return;

        const loadingToast = toast.loading("Deleting project...");
        
        try {
            const res = await axios.delete(
                `${BASE_URL}/projects/delete_project?projectId=${project._id}`, 
                { headers }
            );
            
            toast.update(loadingToast, {
                render: res.data.message || "Project deleted successfully!",
                type: "success",
                isLoading: false,
                autoClose: 2000
            });
            
            setRefresh(prev => prev + 1);
        } catch (err) {
            toast.update(loadingToast, {
                render: err.response?.data?.message || "Delete failed",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}-${month}-${year}`;
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Projects Management
                </h1>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by project name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD005] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-linear-to-r from-[#1B2749] to-[#2a3a5e]">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Sl.No</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Project Code</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Project Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Deadline</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Team Members</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BD005]"></div>
                                            <span className="ml-2 text-gray-600">Loading projects...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProjects.length > 0 ? (
                                filteredProjects.map((project, idx) => (
                                    <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.code}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{project.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <FiClock className="text-gray-400" />
                                                {formatDate(project.deadline)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-xs">
                                                {project.description ? (
                                                    <div className="space-y-1">
                                                        {Object.entries(project.description).map(([key, value]) => (
                                                            <div key={key} className="text-xs">
                                                                <span className="font-medium text-gray-700">{key}:</span>
                                                                <span className="text-gray-600 ml-1">{String(value)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No description</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-h-32 overflow-y-auto pr-2 space-y-2">
                                                {project.teamMembers?.length > 0 ? (
                                                    project.teamMembers.map((member, memberIdx) => (
                                                        <div key={member._id || memberIdx} 
                                                             className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1">
                                                                    <div className="text-xs font-medium text-gray-900">
                                                                        {member.userId?.name || 'N/A'}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {member.role}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        ID: {member.userId?.empId || 'N/A'}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleTeamEdit(idx, memberIdx)}
                                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                        title="Edit member"
                                                                    >
                                                                        <FiEdit size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleTeamDelete(idx, memberIdx)}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                        title="Delete member"
                                                                    >
                                                                        <FiTrash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No team members</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 relative">
                                            <button
                                                onClick={() => handleDropdownClick(idx)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <FiMoreVertical size={20} className="text-gray-600" />
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {openDropdownIndex === idx && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleEdit(idx)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <FiEdit size={16} className="text-blue-600" />
                                                            Update Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleChangeStatus(idx)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <FiCheckCircle size={16} className="text-green-600" />
                                                            Change Status
                                                        </button>
                                                        <button
                                                            onClick={() => handleAddMember(idx)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <FiUserPlus size={16} className="text-purple-600" />
                                                            Add Team Member
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadLogFile(idx)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <FiDownload size={16} className="text-indigo-600" />
                                                            Download Log
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProject(idx)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <FiTrash2 size={16} />
                                                            Delete Project
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                        <FiAlertCircle className="mx-auto mb-2" size={24} />
                                        No projects found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showComponent && (
                <UpdateProject
                    index={index}
                    projectList={projectList}
                    setShowComponent={setShowComponent}
                    setRefresh={setRefresh}
                    refresh={refresh}
                />
            )}

            {showChangeStatus && (
                <ChangeProjectStatus
                    index={index}
                    projectList={projectList}
                    setShowChangeStatus={setShowChangeStatus}
                    setRefresh={setRefresh}
                    refresh={refresh}
                />
            )}

            {addMember && (
                <AddMember
                    index={index}
                    projectList={projectList}
                    setAddMember={setAddMember}
                    setRefresh={setRefresh}
                    refresh={refresh}
                />
            )}

            {showEditMember && (
                <UpdateTeamMember
                    index={index}
                    tmIndex={tmIndex}
                    projectList={projectList}
                    setShowEditMember={setShowEditMember}
                    setRefresh={setRefresh}
                    refresh={refresh}
                />
            )}

            {showDeleteMember && (
                <DeleteTeamMember
                    index={index}
                    tmIndex={tmIndex}
                    projectList={projectList}
                    setShowDeleteMember={setShowDeleteMember}
                    setRefresh={setRefresh}
                    refresh={refresh}
                />
            )}
        </div>
    );
};

export default ProjectList;
