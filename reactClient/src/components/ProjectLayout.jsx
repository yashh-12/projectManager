import React, { useState, useEffect } from 'react';
import { NavLink, useLoaderData, Outlet, useNavigate ,useNavigation,useLocation } from 'react-router-dom';
import { useDispatch , useSelector } from 'react-redux';
import { setLoaderFalse, setLoaderTrue } from '../store/uiSlice.js';
import { createProject } from '../services/projectService.js';
import Sidebar from './Sidebar.jsx';

function ProjectLayout() {

  const navigation = useNavigation()
  const navigate = useNavigate()
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userState);
  const loader = useSelector((state) => state.ui.loader);
  const [authLoader, setAuthLoader] = useState(true);
  const navigating = navigation.state == "loading"

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const res = await getUserDetails();
  //       if (res?.success) {
  //         dispatch(dispatchLogin(res.data));
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user details:', error);
  //     } finally {
  //       setAuthLoader(false);
  //     }
  //   };

  //   fetchUser();
  // }, [dispatch]);

  const isAuthPage = [
    '/login',
    '/Login',
    '/signup',
    '/verify',
    '/verify-email',
    '/',
    '/about',
    '/contact',
  ].includes(location.pathname);

  
if (!user && !isAuthPage) {
    dispatch(setLoaderTrue());
    navigate('/')
    dispatch(setLoaderFalse());
}

  // const [projectName, setProjectName] = useState('');
  // const [deadline, setDeadline] = useState('');
  // const dispatch = useDispatch();

  // const aProjects = useLoaderData();

  // console.log(aProjects?.data);

  // const renderProjects = (projects) => (
  //   projects.map((project) => (
  //     <NavLink 
  //       key={project._id || project.id} 
  //       to={`/projects/${project._id || project.id}`} 
  //       className={({ isActive }) => `block py-2 px-4 border border-gray-500 rounded mb-2 hover:bg-gray-600 ${isActive ? 'bg-blue-700' : 'bg-gray-700'}`}
  //     >
  //       {project.name}
  //     </NavLink>
  //   ))
  // );

  // const handleCreateProject = async () => {
  //   const res = await createProject(projectName, deadline);
  //   if (res.success) {
  //     setIsCreating(false);
  //     setProjectName('');
  //     setDeadline('');
  //     window.location.reload();
  //   }
  // };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* <aside className="w-64 bg-gray-800 p-4">
        <nav className="space-y-4">
          <div className="bg-gray-700 border border-gray-500 rounded mb-2 p-4">
            <NavLink to="/dashboard" className={({ isActive }) => `block w-full text-left py-2 px-4 ${isActive ? 'bg-blue-700' : 'bg-blue-500'} rounded`}>Dashboard</NavLink>
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
            <button className="w-full text-left py-2 px-4 bg-purple-500 rounded">Joined Projects</button>
          </div>
        </nav>
      </aside> */}
      <Sidebar/>

      <div className="flex-1 flex flex-col">
        <main className="p-6 flex gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ProjectLayout;
