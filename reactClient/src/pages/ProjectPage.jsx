import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, useParams, NavLink, useNavigate } from 'react-router-dom';
import { getUnreadChatCount } from '../services/chatService';
import useSocket from '../provider/SocketProvider';
import FlashMsg from '../components/FlashMsg';
import PeerService from '../services/PeerService';
import useStream from '../provider/StreamProvide';

function ProjectPage() {
  
  const [flashMsg, setFlashMsg] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [incomingCallData, setIncomingCallData] = useState('');
  const [remoteStream, setRemoteStream] = useState();
  const { stream, setStream } = useStream()
  
  const [myStream, setMyStream] = useState();
  
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { client } = useSocket();

  const fetchUnreadNotificationCount = async () => {
    const count = await getUnreadChatCount(projectId);
    setUnreadChatCount(count?.data);
  };

  const getMediaPermission = async () => {
    try {
      const collectstream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Got Media Stream:', collectstream);
      return collectstream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setFlashMsg('Please allow microphone and camera');

      setTimeout(() => {
        setFlashMsg('');
      }, 4000);
      return;
    }
  };

  const sendStreams = useCallback(async () => {
    if (!stream) {
      console.log("Stream not available when trying to send tracks",myStream , " ",stream);
      return;
    }
  
    for (const track of stream.getTracks()) {
      await PeerService.peer.addTrack(track, stream);
    }
  }, [stream]);


  const handleMessage = useCallback(() => {
    setUnreadChatCount((prev) => prev + 1);
  }, []);

  const handleMinusRead = useCallback((data) => {
    setUnreadChatCount((prev) => prev - data);
  }, []);

  const handleIncomingCall = useCallback((data) => {
    setIncomingCallData(data);
  }, []);



  const handleStartHandshake = useCallback(async (roomId) => {
    
    const offer = await PeerService.getOffer();
    client.emit("sendOffer", { offer, roomId });
    
  }, [client]);



  const handleOffer = useCallback(async ({ roomId, offer }) => {

    const answer = await PeerService.getAnswer(offer);
    client.emit("sendAnswer", { roomId, answer });
    sendStreams();
  }, [client]);



  
  
  
  const handleAnswer = useCallback(
    async ({ roomId, answer }) => {
      await PeerService.setLocalDescription(answer);
      setStream(stream)
      setMyStream(stream)
      sendStreams();
      console.log("Call Accepted!");
    },
    [sendStreams]
  );
  
  


  useEffect(() => {
    PeerService.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
      console.log("remote stream ",remoteStream);
      
    });
  }, [stream,remoteStream]);    



  useEffect(() => {
    if (!client) return;

    client.on("recMessage", handleMessage);
    client.on("minusRead", handleMinusRead);
    client.on("incoming-call", handleIncomingCall);
    client.on("startHandshake", handleStartHandshake);
    client.on("offer", handleOffer);
    client.on("answer", handleAnswer);

    return () => {
      client.off("recMessage", handleMessage);
      client.off("minusRead", handleMinusRead);
      client.off("incoming-call", handleIncomingCall);
      client.off("startHandshake", handleStartHandshake);
      client.off("offer", handleOffer);
      client.off("answer", handleAnswer);
    };
  }, [
    client,
    handleMessage,
    handleMinusRead,
    handleIncomingCall,
    handleStartHandshake,
    handleOffer,
    handleAnswer,
  ]);

  const handleCall = async () => {
    const collectStream = await getMediaPermission();    
    setStream(collectStream)
    setMyStream(collectStream)
    console.log("collected stream ",collectStream);
    
    if (collectStream) {
      client.emit("join-personalRoom", incomingCallData.roomId);
      setIncomingCallData("");
    }
  };

  useEffect(() => {
    fetchUnreadNotificationCount();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full font-inter">
      <FlashMsg message={flashMsg} setMessage={() => setFlashMsg("")} />
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
     {(stream && remoteStream) && (
        <div className="relative w-full h-[500px] bg-black flex">
          {remoteStream ? (
            <video
              className="w-1/2 h-full object-cover"
              ref={video => video && (video.srcObject = remoteStream)}
              autoPlay
              playsInline
            />
          ) : (
            <div className="w-1/2 h-full bg-black" />
          )}
          {stream && (
            <video
              className="w-1/2 h-full object-cover border-l-2 border-white"
              ref={video => video && (video.srcObject = stream)}
              muted
              autoPlay
              playsInline
            />
          )}
        </div>
      )}

      <main className="flex-1 w-full px-8 py-6 bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}

export default ProjectPage;
