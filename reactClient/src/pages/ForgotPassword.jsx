import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { sendOtpForfgtPwd, verifyOtpPassword } from "../services/authService";
import { useDispatch } from "react-redux";
import { setLoaderFalse, setLoaderTrue } from "../store/uiSlice";

function ForgotPassword() {
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [enterOtpForm, setEnterOtpForm] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const res = await sendOtpForfgtPwd(email);
        if (res.success) {
            dispatch(setLoaderTrue())
            setEnterOtpForm(true);
            dispatch(setLoaderFalse())
        }

    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        console.log("OTP:", otp);
        console.log("New Password:", newPassword);
        console.log("Confirm Password:", confirmPassword);
        dispatch(setLoaderTrue())
        const res1 = await verifyOtpPassword(otp, email, newPassword, confirmPassword)
        if (res1.success) {
            setOtp("")
            setNewPassword("")
            setConfirmPassword("")
            navigate("/login")
        }
        dispatch(setLoaderFalse())
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
                    <NavLink to="/" className={({ isActive }) => `${isActive ? "text-blue-300" : "text-gray-50"} hover:text-gray-600 dark:hover:text-gray-400`}>Home</NavLink>
                    <NavLink to="/about" className={({ isActive }) => `${isActive ? "text-blue-300" : "hover:text-gray-600 dark:hover:text-gray-400"}`}>About</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => `${isActive ? "text-blue-300" : "hover:text-gray-600 dark:hover:text-gray-400"}`}>Contact</NavLink>
                </nav>
            </header>

            <div className="flex flex-grow items-center justify-center px-20">
                {!enterOtpForm ? (
                    <form
                        onSubmit={handleSendOtp}
                        className="relative bg-gray-800 p-10 rounded-xl shadow-lg w-full max-w-md space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-white text-center">
                            Recover Password
                        </h2>

                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-gray-400 mb-2">
                                Enter your email address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@example.com"
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
                        >
                            Send OTP
                        </button>

                        <div className="text-center mt-3">
                            <p className="text-gray-400">
                                Remembered your password?{" "}
                                <Link to="/login" className="text-blue-500 hover:underline">
                                    Go back to Login
                                </Link>
                            </p>
                        </div>
                    </form>
                ) : (
                    <form
                        onSubmit={handleVerifyOtp}
                        className="relative bg-gray-800 p-10 rounded-xl shadow-lg w-full max-w-md space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-white text-center">
                            Reset Password
                        </h2>

                        <div className="flex flex-col">
                            <label htmlFor="otp" className="text-gray-400 mb-2">
                                OTP sent to <span className="text-blue-300">{email}</span>
                            </label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                placeholder="Enter OTP"
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="newPassword" className="text-gray-400 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                placeholder="Enter new password"
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="confirmPassword" className="text-gray-400 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
                        >
                            Reset Password
                        </button>

                        <div className="text-center mt-3">
                            <p className="text-gray-400">
                                Didn't receive the code?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtp("");
                                        setNewPassword("")
                                        setConfirmPassword("")
                                        setEnterOtpForm(false)
                                    }}
                                    className="text-blue-400 hover:underline"
                                >
                                    Resend
                                </button>
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
