import React, { useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { setLoaderTrue, setLoaderFalse } from "../store/uiSlice";
import { useDispatch } from "react-redux";
import { register } from "../services/authService.js";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const signup = async (e) => {
    e.preventDefault();
    dispatch(setLoaderTrue());
    const res = await register(name, username, email, password);
    console.log(res);
    if (res.success) {
      dispatch(setLoaderFalse());
      localStorage.setItem("email", res?.data?.email);
      navigate("/verify-email");
    } else {
      dispatch(setLoaderFalse());
      navigate("/signup");
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
          className="relative bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
          onSubmit={signup}
          method="post"
        >
          <h2 className="text-3xl font-bold text-white mb-4 text-center">Sign Up</h2>

          <div className="flex flex-col">
            <label htmlFor="name" className="text-gray-400 mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              className="p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-400 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="username" className="text-gray-400 mb-2">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              className="p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-400 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-gray-400 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-400 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-400 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-md mt-4 font-semibold hover:bg-blue-600 transition-colors"
          >
            Sign Up
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
