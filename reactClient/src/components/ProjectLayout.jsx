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


  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
    
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
