import React from 'react'
import {Link,NavLink} from "react-router-dom"


function About() {
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
      <main className="flex-grow flex flex-col items-center justify-center px-12">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-4">About Us</h2>
          <p className="text-lg leading-relaxed mb-6">
            We are a modern digital agency committed to delivering innovative solutions.
            Our team of experts works collaboratively to bring your ideas to life and drive growth.
          </p>
          <p className="text-lg leading-relaxed">
            Our mission is to transform your business with cutting-edge technology and creative strategies.
            We believe in the power of digital transformation and strive to exceed expectations with every project.
          </p>
        </div>
      </main>

      <footer className="w-full py-4 px-12 bg-gray-50 dark:bg-gray-900 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} LOGOTYPE. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default About