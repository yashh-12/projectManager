import React, { useState, useEffect } from 'react';
import { setLoaderFalse, setLoaderTrue } from '../store/uiSlice';
import { useDispatch } from 'react-redux';
import { useNavigate ,NavLink} from 'react-router-dom';
import { verifyEmail, resendOtp } from '../services/authService';

function Verify() {
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(120);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoaderTrue());
    const res = await verifyEmail(otp, localStorage.getItem('email'));
    if (res.success) {
      dispatch(setLoaderFalse());
      navigate('/login');
    } else {
      dispatch(setLoaderFalse());
    }
  };

  const handleResendOtp = async () => {
    dispatch(setLoaderTrue());

    const res = await resendOtp(localStorage.getItem('email'));
    if (res.success) {
      setResendTimer(120);
    }
    
    dispatch(setLoaderFalse());
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="w-full py-6 px-12 flex justify-between items-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <img
          src="../../project-management.png"
          alt="Project Management Logo"
          className="w-14 h-14 object-contain"
        />
        <nav className="space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) => `${isActive ? "text-blue-300" : "text-gray-50"} hover:text-gray-600 dark:hover:text-gray-400`}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `${isActive ? "text-blue-300" : "hover:text-gray-600 dark:hover:text-gray-400"}`}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `${isActive ? "text-blue-300" : "hover:text-gray-600 dark:hover:text-gray-400"}`}
          >
            Contact
          </NavLink>
        </nav>
      </header>

      <div className="flex flex-grow items-center justify-center px-20">
        <form
          onSubmit={handleOtpSubmit}
          className="relative bg-gray-800 p-10 rounded-xl shadow-lg w-full max-w-md space-y-6"
        >
          <h2 className="text-3xl font-bold text-white text-center">OTP Verification</h2>

          <div className="flex flex-col">
            <label htmlFor="otp" className="text-gray-400 mb-2">Enter OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              placeholder="Enter the OTP sent to your email"
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white text-center tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
          >
            Verify OTP
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${resendTimer > 0 ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Verify;