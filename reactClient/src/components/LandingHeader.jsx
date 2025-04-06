import React from 'react'
import { NavLink } from 'react-router-dom';


function LandingHeader() {
    return (
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
    )
}

export default LandingHeader