import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from "../services/authService.js";
import { dispatchLogout } from '../store/authSlice.js';
import { Bell, X } from 'lucide-react';
import {
  getAllreadNotification,
  getAllUnreadNotification,
  getUnreadNotificationCount,
  notificationMarkAsRead
} from '../services/notificationService.js';
import useSocket from '../provider/SocketProvider.jsx';


function Header() {
  const {projectId} = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const { client } = useSocket();
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const [readFetched, setReadFetched] = useState(false);


  useEffect(() => {
    if (!client || !projectId) return;

    const increaseNotificationCount = (data) => {
      setNotificationCount(prev => prev + 1)
    }

    client.emit("register", { userId: userData._id ,projectId});


    client.on("recTask", increaseNotificationCount)
    client.on("remTask", increaseNotificationCount)
    // client.on("modify", increaseNotificationCount)
    client.on("assignMember", increaseNotificationCount)
    client.on("removeFromTeam", increaseNotificationCount)
    client.on("deleteTeam", increaseNotificationCount)


  }, [client])

  const fetchNotificationCount = async () => {
    const count = await getUnreadNotificationCount();
    setNotificationCount(count?.data);
  };

  const handleShowNotification = async () => {
    if (!showNotification) {
      const res = await getAllUnreadNotification();
      if (res.success) {
        setUnreadNotifications(res.data);
        await notificationMarkAsRead(res.data);
        setNotificationCount(0);
      }
      setShowRead(false);
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  };

  const handleToggleRead = async () => {
    if (!showRead && !readFetched) {
      const resp = await getAllreadNotification();
      if (resp.success) {
        setReadNotifications(resp.data);
        setReadFetched(true);
      }
    }
    setShowRead(!showRead);
  };

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      dispatch(dispatchLogout());
      navigate('/');
    }
  };

  return (
    <header className="w-full relative flex items-center justify-between px-6 py-4 bg-gray-900 shadow-md text-white">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full cursor-pointer transition-shadow duration-200 shadow-md"
          onClick={() => navigate("/projects")}
        >
          <img src="/project-management.png" className="w-8 h-8 object-cover" />
        </div>

        <div
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full cursor-pointer transition-shadow duration-200 shadow-md"
          onClick={() => navigate("/profile")}
        >
          <img
            src={
              userData?.avatar ||
              'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
            }
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-base font-medium">{userData?.username || 'User'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <div
          className="relative cursor-pointer hover:scale-105 transition-transform duration-150"
          onClick={handleShowNotification}
        >
          <Bell className="w-5 h-5 text-white" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
              {notificationCount}
            </span>
          )}
        </div>

        {showNotification && (
          <div className="absolute right-20 top-14 w-72 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-700 border-b border-gray-600">
              <span className="text-sm font-semibold text-white">
                {showRead ? "Read Notifications" : "Unread Notifications"}
              </span>
              <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {(showRead ? readNotifications : unreadNotifications).length > 0 ? (
              <ul className="max-h-64 overflow-y-auto">
                {(showRead ? readNotifications : unreadNotifications).map((note, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 border-b border-gray-700 last:border-none"
                  >
                    {note.message}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-sm text-gray-400 text-center">
                {showRead ? "No read notifications." : "No unread notifications."}
              </div>
            )}

            <div className="p-2 border-t border-gray-600 text-center">
              <button
                onClick={handleToggleRead}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                {showRead ? "View Unread" : "View Read"}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200 text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
