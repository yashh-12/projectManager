import React from 'react';
import {useNavigate} from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import {logout} from "../services/authService.js"
import { dispatchLogout } from '../store/authSlice';

function Header() {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.auth.userState);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const res = await logout()
    console.log(res);
    
    if (res.success) {
    dispatch(dispatchLogout());
    navigate('/');
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#1f2937',
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={userState?.profileImage }
          alt="User Profile"
          style={{ borderRadius: '50%', marginRight: '0.5rem' }}
        />
        <span>{userState?.name || 'User'}</span>
      </div>

      <div style={{ flex: 1, marginLeft: '1rem', marginRight: '1rem' }}>
        <input
          type="text"
          placeholder="Search..."
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            outline: 'none',
          }}
        />
      </div>

      <button
        style={{
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </header>
  );
}

export default Header;
