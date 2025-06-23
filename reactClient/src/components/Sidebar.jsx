import React, { useState } from 'react';
import { Link, useLoaderData, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, deleteProject } from '../services/projectService.js';
import { FaTrash } from 'react-icons/fa';
import { dispatchOwnerFalse, dispatchOwnerTrue } from '../store/authSlice.js';

function Sidebar() {
    const [isCreating, setIsCreating] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const fiveMonthsFromNow = new Date();
    fiveMonthsFromNow.setMonth(fiveMonthsFromNow.getMonth() + 5);
    const defaultDeadline = fiveMonthsFromNow.toISOString().split("T")[0];
    const [deadline, setDeadline] = useState(defaultDeadline);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projects, setProjects] = useState(useLoaderData()?.data || []);
    const dispatch = useDispatch();
    const userData = useSelector(state => state.auth.userData);

    const location = useLocation();

    const currentPath = location.pathname;

    const isProjectActive = (projectId) =>
        currentPath === `/projects/${projectId}` ||
        currentPath.startsWith(`/projects/${projectId}/`);


    const handleCreateProject = async () => {
        const res = await createProject(projectName, deadline);
        console.log(res);

        if (res.success && res.data) {
            setProjects(prev => [...prev, res.data]);
            console.log(res.data);

            setIsCreating(false);
            setProjectName('');
            setDeadline('');
        }
    };


    const handleDelete = async () => {
        try {
            const res = await deleteProject(selectedProjectId);
            console.log(res);
            if (res.success) {
                setShowDeleteModal(false);
                setProjects(projects.filter((p) => p._id !== selectedProjectId));
            }
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    const renderProjects = () =>
        projects.map((project) => (
            <div key={project._id} className="flex items-center justify-between group">
                <NavLink
                    to={`/projects/${project._id}/overview`}
                    className={
                        `flex items-center gap-2 flex-1 text-left px-4 py-2 rounded-lg transition ${isProjectActive(project._id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`
                    }
                >
                    {project.name}
                </NavLink>


                {project.owner === userData?._id && (
                    <button
                        onClick={() => {
                            setShowDeleteModal(true);
                            setSelectedProjectId(project._id);
                        }}
                        className="ml-2 p-2 text-red-500 hover:text-red-700"
                        title="Delete Project"
                    >
                        <FaTrash className="text-sm" />
                    </button>
                )}
            </div>
        ));

    return (
        <>
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-[90%] max-w-sm text-center border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Delete Project?</h2>
                        <p className="mb-6 text-gray-300">Are you sure you want to delete this project? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Confirm Delete
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedProjectId(null);
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <aside className="w-64 min-h-screen bg-gray-900 text-white p-4 border-r border-gray-700 shadow-md">
                <nav className="space-y-6">
                    <Link
                        to="/projects"
                        className="block w-full text-left px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow"
                    >
                        Dashboard
                    </Link>

                    <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Projects</h3>

                        {isCreating ? (
                            <div className="space-y-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Project Name"
                                    className="w-full p-2 text-sm bg-gray-900 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    required
                                />
                                <input
                                    type="date"
                                    className="w-full p-2 text-sm bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateProject}
                                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                                    >
                                        Submit
                                    </button>
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full py-2 px-4 mb-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                            >
                                + Create Project
                            </button>
                        )}

                        <div className="space-y-2">
                            {projects?.length > 0 ? (
                                renderProjects()
                            ) : (
                                <p className="text-sm text-gray-400">No projects available</p>
                            )}
                        </div>

                    </div>
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;
