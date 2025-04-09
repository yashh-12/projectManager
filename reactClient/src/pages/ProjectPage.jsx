import React, { useState } from 'react';
import { Outlet, useParams, NavLink, useNavigate, useRevalidator } from 'react-router-dom';
import { deleteProject } from '../services/projectService';

function ProjectPage() {
  const { projectId } = useParams();

  return (
    <>

      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full font-inter">
        {/* Top Navigation Bar */}
        <div className="w-full flex justify-between items-center px-8 py-6 bg-gray-850 shadow-md border-b border-gray-700">
          <div className="flex space-x-4">
            {['overview', 'tasks', 'teams', 'chat'].map((item) => (
              <NavLink
                key={item}
                to={`/projects/${projectId}/${item}`}
                className={({ isActive }) =>
                  `px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`
                }
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </NavLink>
            ))}
          </div>
          
        </div>

        <main className="flex-1 w-full px-8 py-4 bg-gray-900">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default ProjectPage;
