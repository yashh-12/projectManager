import React, { useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { setLoaderTrue, setLoaderFalse, setMessage } from "../store/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../services/authService.js";
import { dispatchLogin } from "../store/authSlice.js";
import FlashMsg from "../components/FlashMsg.jsx";

function Login() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const loginUser = async (e) => {
    e.preventDefault();
    dispatch(setLoaderTrue());
    const res = await login(usernameOrEmail, password);
    console.log(res);
    if (res.success) {
      dispatch(dispatchLogin());
      dispatch(setMessage("Logged in successfully"));
      navigate("/projects");
      dispatch(setLoaderFalse());
    } else if(res.message === "Please verify your email") {
      navigate("/signup");
      dispatch(setLoaderFalse());
    } else {
      navigate("/login");
      dispatch(setLoaderFalse());
    }
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
          onSubmit={loginUser}
          className="relative bg-gray-800 p-10 rounded-xl shadow-lg w-full max-w-md space-y-6"
        >
          <h2 className="text-3xl font-bold text-white text-center">Login</h2>

          <div className="flex flex-col">
            <label htmlFor="usernameOrEmail" className="text-gray-400 mb-2">Username or Email</label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              placeholder="Enter your username or email"
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white transition"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-gray-400 mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
