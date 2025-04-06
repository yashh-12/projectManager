import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

function ProjectPage() {
  const { projectId } = useParams();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
      {/* Top Navigation Bar - Full Width */}
      <div className="w-full flex justify-between items-center p-6 bg-gray-800 shadow-md">
        <div className="flex space-x-4">
          {['overview', 'tasks', 'teams', 'chat'].map((item) => (
            <NavLink
              key={item}
              to={`/projects/${projectId}/${item}`}
              className={({ isActive }) =>
                `px-6 py-3 rounded-lg font-medium border ${isActive
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`
              }
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default ProjectPage;
