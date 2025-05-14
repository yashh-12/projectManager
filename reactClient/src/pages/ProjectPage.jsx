import React, { useEffect, useState } from 'react';
import { Outlet, useParams, NavLink, useNavigate } from 'react-router-dom';
import { getUnreadChatCount } from '../services/chatService';
import useSocket from '../provider/SocketProvider';
import FlashMsg from '../components/FlashMsg';

function ProjectPage() {
  const [flashMsg, setFlashMsg] = useState('');

  const navigate = useNavigate();
  const { projectId } = useParams();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const { client } = useSocket();
  const [incomingCallData, setIncomingCallData] = useState("");

  const fetchUnreadNotificationCount = async () => {
    const count = await getUnreadChatCount(projectId);
    setUnreadChatCount(count?.data);
  };

  const getMediaPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Got Media Stream:', stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setFlashMsg('Please allow microphone and camera');
      setTimeout(() => {
        setFlashMsg('');
      }, 4000);
      return ;
    }
  };

  useEffect(() => {
    if (!client) return;

    const handleMessage = () => {
      setUnreadChatCount((prev) => prev + 1);
    };

    const handleMinusRead = (data) => {
      setUnreadChatCount((prev) => prev - data);
    };

    const handleIncomingCall = (data) => {
      setIncomingCallData(data);
    };

    client.on("recMessage", handleMessage);
    client.on("minusRead", handleMinusRead);
    client.on("incoming-call", handleIncomingCall);

    return () => {
      client.off("recMessage", handleMessage);
      client.off("minusRead", handleMinusRead);
      client.off("incoming-call", handleIncomingCall);
    };
  }, [client]);


  const handleCall = async () => {
    const stream = await getMediaPermission();
    console.log(stream);
    
    if (stream) {

      client.emit("join-personalRoom", incomingCallData.roomId);
      setIncomingCallData("");
      navigate(`/projects/${projectId}/videocall`);
    }
  }

  useEffect(() => {
    fetchUnreadNotificationCount();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full font-inter">
      <FlashMsg message={flashMsg} setMessage={() => setFlashMsg("")}/>
      {incomingCallData &&
        <div className="bg-gray-800 border border-blue-500 rounded-xl mx-8 my-4 p-6 flex justify-between items-center shadow-lg">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Incoming Video Call
            </h2>
            <p className="text-sm text-gray-300">
              You have a call from <span className="font-medium text-white">{incomingCallData?.user?.username}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCall}
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition font-medium shadow-md"
            >
              Accept
            </button>
            <button
              onClick={() => setIncomingCallData("")}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-medium shadow-md"
            >
              Reject
            </button>
          </div>
        </div>
      }

      <div className="w-full flex justify-between items-center px-8 py-6 bg-gray-850 shadow-md border-b border-gray-800">
        <div className="flex space-x-4">
          {['overview', 'tasks', 'teams', 'chat'].map((item) => (
            <NavLink
              key={item}
              to={`/projects/${projectId}/${item}`}
              className={({ isActive }) =>
                `relative px-6 py-2.5 rounded-full text-sm font-medium capitalize transition-all duration-200
                ${isActive
                  ? 'bg-blue-600 text-white shadow-inner scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-blue-500 hover:text-white'
                }`
              }
            >
              {item}

              {item === 'chat' && unreadChatCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {unreadChatCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="flex-1 w-full px-8 py-6 bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}

export default ProjectPage;
