import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Outlet, useParams, NavLink, useNavigate } from 'react-router-dom';
import { getUnreadChatCount } from '../services/chatService';
import useSocket from '../provider/SocketProvider';
import FlashMsg from '../components/FlashMsg';
import PeerService from '../services/PeerService';
import useStream from '../provider/StreamProvide';
import { SiBukalapak } from 'react-icons/si';
import { getProjectMetaData } from '../services/projectService';
import { useDispatch, useSelector } from 'react-redux';
import { dispatchOwnerTrue } from '../store/authSlice';
import {  getUnreadNotificationCount } from '../services/notificationService';

function ProjectPage() {
  const dispatch = useDispatch()
  const [flashMsg, setFlashMsg] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [incomingCallData, setIncomingCallData] = useState('');
  const [remoteStream, setRemoteStream] = useState();
  const { stream, setStream } = useStream()
  const userData = useSelector(state => state.auth.userData)
  const [myStream, setMyStream] = useState();
  const collectedStream = useRef(null);

  const navigate = useNavigate();
  const { projectId } = useParams();
  const { client } = useSocket();
  const remotee = useRef(null)

  const fetchUnreadChatCount = async () => {
    const count = await getUnreadChatCount(projectId);
    setUnreadChatCount(count?.data);
  };

  // const fetchUnreadNotificationCount = async () => {
  //   const count = await getUnreadNotificationCount();
  //   console.log("count ", count);

  //   setUnreadNotificationCount(count?.data);
  // };


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
      console.log("Stream not available when trying to send tracks", stream);
      return;
    }
    console.log("stream sent ");
    for (const track of stream.getTracks()) {
      PeerService.peer.addTrack(track, stream);
    }
  }, [stream]);

  const sendCollectedStreams = useCallback(async () => {
    if (!collectedStream.current) {
      console.log("Stream not available when trying to send tracks", collectedStream.current);
      return;
    }
    console.log("stream sent ");

    for (const track of collectedStream.current.getTracks()) {
      PeerService.peer.addTrack(track, collectedStream.current);
    }
  }, []);


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
    console.log("send offer ");

    client.emit("sendOffer", { offer, roomId });

  }, [client]);



  const handleOffer = useCallback(async ({ roomId, offer }) => {
    console.log("Offer came ", collectedStream.current, " ", stream);

    const answer = await PeerService.getAnswer(offer);
    client.emit("sendAnswer", { roomId, answer });
    sendCollectedStreams();
  }, [client]);


  const handleAnswer = useCallback(
    async ({ roomId, answer }) => {

      // console.log("Answer came ", stream);

      await PeerService.setRemoteDescription(answer);
      sendStreams();
      // console.log("Call Accepted!");

    },
    [sendStreams]
  );




  useEffect(() => {
    PeerService.peer.addEventListener("track", async (ev) => {
      const remoteStre = ev.streams;
      setRemoteStream(remoteStre[0]);
    });
  }, [stream, sendStreams, sendCollectedStreams, collectedStream, remoteStream]);



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
    collectedStream.current = await getMediaPermission();

    console.log("collected stream ", collectedStream.current);
    setStream(collectedStream.current)

    if (collectedStream.current) {
      client.emit("join-personalRoom", incomingCallData.roomId);
      setIncomingCallData("");
    }
  };

  useEffect(() => {
    fetchUnreadChatCount();
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
      {((stream || collectedStream.current) && remoteStream) && (
        <div className="relative w-full h-[500px] bg-black flex">

          {remoteStream ? (
            <div className="relative w-1/2 h-full">
              <video
                className="w-full h-full object-cover"
                ref={(video) => video && (video.srcObject = remoteStream)}
                autoPlay
                playsInline
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded">
                Remote
              </div>
            </div>
          ) : (
            <div className="w-1/2 h-full bg-black" />
          )}

          {(stream || collectedStream.current) && (
            <div className="relative w-1/2 h-full border-l-2 border-white">
              <video
                className="w-full h-full object-cover"
                ref={(video) => video && (video.srcObject = stream ?? collectedStream.current)}
                muted
                autoPlay
                playsInline
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded">
                You
              </div>
            </div>
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
