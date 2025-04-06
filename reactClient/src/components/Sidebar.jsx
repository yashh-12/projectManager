import React, { useState } from 'react';
import { Link, useLoaderData,NavLink, useNavigate, useNavigation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoaderFalse, setLoaderTrue } from '../store/uiSlice.js';
import { createProject } from '../services/projectService.js';
function Sidebar() {
    const [isCreating, setIsCreating] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [deadline, setDeadline] = useState('');
    const dispatch = useDispatch();
    const aProjects = useLoaderData();

    

    // console.log(aProjects?.data);

    const renderProjects = (projects) => (
        projects.map((project) => (
            <NavLink
                key={project._id || project.id}
                to={`/projects/${project._id || project.id}/overview`}
                className={({ isActive }) =>
                    `block py-2 px-4 border border-gray-500 rounded mb-2 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`
                }
            >
                {project.name}
            </NavLink>
        ))
    );

    const handleCreateProject = async () => {
        console.log('Creating project:', { projectName, deadline });
        const res = await createProject(projectName, deadline);
        if (res.success) {
            setIsCreating(false);
            setProjectName('');
            setDeadline('');
            window.location.reload();
        }
    };

    return (
        <aside className="w-64 bg-gray-800 p-4">
            <nav className="space-y-4">
                <div className="bg-gray-700 border border-gray-500 rounded mb-2 p-4">
                    <Link to="/projects" className="block w-full text-left py-2 px-4 bg-blue-500 rounded">Dashboard</Link>
                </div>
                <div className="bg-gray-700 border border-gray-500 rounded mb-2 p-4">
                    <h3 className="text-gray-400 mb-2">Projects</h3>
                    {isCreating ? (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Project Name"
                                className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                            />
                            <input
                                type="date"
                                className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                            <button onClick={handleCreateProject} className="w-full py-2 px-4 bg-green-500 rounded mb-2">Submit</button>
                            <button onClick={() => setIsCreating(false)} className="w-full py-2 px-4 bg-red-500 rounded">Cancel</button>
                        </div>
                    ) : (
                        <button className="w-full text-left py-2 px-4 bg-green-500 rounded mb-2" onClick={() => setIsCreating(true)}>
                            Create Project
                        </button>
                    )}
                    <div className="mb-4">
                        {aProjects?.data?.length > 0 ? renderProjects(aProjects.data) : <p>No projects available</p>}
                    </div>
                    <button className="w-full text-left py-2 px-4 bg-purple-500 rounded">Join a Projects</button>
                </div>
            </nav>
        </aside>
    )
}

export default Sidebar