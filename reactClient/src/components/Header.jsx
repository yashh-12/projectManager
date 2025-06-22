import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from "../services/authService.js";
import { dispatchLogout } from '../store/authSlice.js';
import { Bell } from 'lucide-react';
import { getUnreadNotificationCount } from '../services/notificationService.js';

function Header() {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotificationCount = async () => {
    const count = await getUnreadNotificationCount();
    setNotificationCount(count);
  };

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      dispatch(dispatchLogout());
      navigate('/');
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 shadow-md text-white">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full cursor-pointer transition-shadow duration-200 shadow-md"
          onClick={() => navigate("/projects")}
        >
          <img
            src="/project-management.png"
            className="w-8 h-8 object-cover"
          />
        </div>

        <div
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full cursor-pointer transition-shadow duration-200 shadow-md"
          onClick={() => navigate("/profile")}
        >
          <img
            src={
              userData?.avatar ||
              'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
            }
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-base font-medium">{userData?.username || 'User'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer hover:scale-105 transition-transform duration-150">
          <Bell className="w-5 h-5 text-white" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
              {notificationCount}
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200 text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
