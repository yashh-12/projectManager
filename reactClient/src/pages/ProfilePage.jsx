import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FlashMsg from '../components/FlashMsg';
import { changePassword, changeUserDetails, uploadAvatar } from '../services/authService';
import Error from '../components/Error';
import { dispatchAvatar, dispatchLogin } from '../store/authSlice';

function ProfilePage() {
  const userDetails = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState('avatar');
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState(userDetails?.username || '');
  const [name, setName] = useState(userDetails?.name || '');
  const [email, setEmail] = useState(userDetails?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState("");
  const [error,setError] = useState("")

  const handleAvatarChange = async (e) => {
    const res =  await uploadAvatar(e.target.files[0]);
    if(res.success){
      dispatch(dispatchAvatar(res.data))
      setMessage("Avatar changed Successfully")
    } else {
      setMessage("Something went wrong")
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const res = await changeUserDetails(name, username, email)
    if (res.success) {
      dispatch(dispatchLogin(res?.data))
      setMessage(res?.message)
      setUsername("")
      setName("")
      setEmail("")
    } else {
      setError(res?.message)
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const res = await changePassword(userDetails.email, currentPassword, newPassword)
    if (res.success) {
      setMessage(res?.message)
      setCurrentPassword("")
      setNewPassword("")
    } else {
      setError("Incorrect password")
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <FlashMsg message={message} setMessage={setMessage} />
      <Error error={error} setError={setError}/>
      <aside className="w-64 rounded-lg bg-gray-800 p-6 space-y-6">
        <h2 className="text-xl font-bold mb-6">Settings</h2>
        {/* <button
          className={`w-full text-left px-4 py-2 rounded-lg ${activeSection === 'overall' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveSection('overall')}
        >
          Overall
        </button> */}
        <button
          className={`w-full text-left px-4 py-2 rounded-lg ${activeSection === 'avatar' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveSection('avatar')}
        >
          Change Avatar
        </button>
        <button
          className={`w-full text-left px-4 py-2 rounded-lg ${activeSection === 'password' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveSection('password')}
        >
          Change Password
        </button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

        {activeSection === 'overall' && (
          <form onSubmit={handleProfileUpdate} className="space-y-6 bg-gray-900 p-8 rounded-xl shadow-md max-w-xl mx-auto border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Update Details</h2>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg transition-all duration-300"
            >
              Save Changes
            </button>
          </form>
        )}

        {activeSection === 'avatar' && (
          <div className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-semibold mb-4">Change Avatar</h2>
            <div className="relative w-32 h-32">
              <img
                src={userDetails?.avatar || "/default-avatar.png"}
                alt="Current Avatar"
                className="rounded-full border-4 border-gray-700 w-32 h-32 object-cover"
              />
              <label htmlFor="avatar-upload">
                <div className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6m-6 6l-2.121 2.121a3 3 0 104.243 4.243L15 15" />
                  </svg>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {activeSection === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium shadow-md"
            >
              Change Password
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default ProfilePage;
