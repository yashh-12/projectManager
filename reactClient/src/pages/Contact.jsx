import React from 'react'
import {Link,NavLink} from "react-router-dom"

function Contact() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
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
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 sm:px-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Contact Us</h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Your email"
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                placeholder="Your message"
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              ></textarea>
            </div>
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-4 px-12 bg-gray-50 dark:bg-gray-900 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} LOGOTYPE. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default Contact