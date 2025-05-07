import React, { useEffect, useState } from 'react';
import { Outlet, useParams, NavLink } from 'react-router-dom';
import { getUnreadChatCount } from '../services/chatService';
import useSocket from '../provider/SocketProvider';

function ProjectPage() {
  const { projectId } = useParams();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const {client} = useSocket()

  const fetchUnreadNotificationCount = async () => {

    const count = await getUnreadChatCount(projectId);        
    setUnreadChatCount(count?.data);
  };

    useEffect(() => {
      if (!client) return;
  
      const handleMessage = (data) => {
        console.log("ran");
        
        setUnreadChatCount((prev ) => prev + 1 )
      };
  
      client.on("recMessage", handleMessage);

      client.on("minusRead",(data) => {
        setUnreadChatCount((prev ) => prev - data )

      })
  
      return () => {
        client.off("recMessage", handleMessage);
      };
    }, [client]);

  useEffect(() => {
    fetchUnreadNotificationCount();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full font-inter">
      <div className="w-full flex justify-between items-center px-8 py-6 bg-gray-850 shadow-md border-b border-gray-700">
        <div className="flex space-x-4">
          {['overview', 'tasks', 'teams', 'chat'].map((item) => (
            <NavLink
              key={item}
              to={`/projects/${projectId}/${item}`}
              className={({ isActive }) =>
                `relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`
              }
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}

              {item === 'chat' && unreadChatCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadChatCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="flex-1 w-full px-8 py-4 bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}

export default ProjectPage;
