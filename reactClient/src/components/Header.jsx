import React from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from "../services/authService.js";
import { dispatchLogout } from '../store/authSlice';

function Header() {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      dispatch(dispatchLogout());
      navigate('/');
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 shadow-md text-white">
      <div className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full cursor-pointer transition-shadow duration-200 shadow-md">
        <img
          src={
            userData?.avatar ||
            'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
          }
          alt="User"
          className="w-9 h-9 rounded-full object-cover"
        />
        <span className="text-sm font-semibold">{userData?.username || 'User'}</span>
      </div>

      <div className="flex-1 mx-6">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300 text-sm"
        />
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200"
      >
        Logout
      </button>
    </header>
  );
}

export default Header;
