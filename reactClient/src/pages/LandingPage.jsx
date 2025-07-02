import React from 'react';
import {Link,NavLink} from "react-router-dom"

const LandingPage = () => {
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
                    className={({ isActive }) => `${isActive ? "text-blue-300" : "text-gray-50"} hover:text-gray-600 dark:hover:text-gray-400 `}
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
      <div className="flex flex-grow items-center justify-between px-20">
        <div className="max-w-lg px-13">
          <h1 className="text-5xl font-bold">Welcome to Our Platform</h1>
          <p className="mt-4 text-lg">
            We provide the best solutions to grow your business with cutting-edge technology and expert guidance.
          </p>
          <button className="mt-8 bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-lg">
            <Link to="/login"> Get Started </Link>
          </button>
        </div>
        <img
          src="../../19720.jpg"
          alt="Business Growth"
          className="w-1/2 rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default LandingPage;
