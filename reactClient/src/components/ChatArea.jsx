import React, { useEffect, useRef, useState } from 'react';
import { getMessages, markChatAsRead, sendMessage } from '../services/chatService';
import useSocket from '../provider/SocketProvider';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import FlashMsg from './FlashMsg';
import { da } from 'date-fns/locale';
import useStream from '../provider/StreamProvide';

function ChatArea({ selectedUser }) {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [flashMsg, setFlashMsg] = useState('');
  const { projectId } = useParams();
  const { client } = useSocket();
  const messagesEndRef = useRef(null);
  const userData = useSelector(state => state.auth.userData);
  const [confirmMakeCall, setConfirmMakeCall] = useState(false);
  const { stream, setStream } = useStream();

  const getMediaPermission = async () => {
    try {
      const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Got Media Stream:', myStream);
      setStream(myStream)

      setConfirmMakeCall(true);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setFlashMsg('Please allow microphone and camera');
      setTimeout(() => {
        setFlashMsg('');
      }, 4000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    if (!client) return;

    client.emit("register", { userId: userData._id, projectId });


    const handleMessage = async (data) => {

      if (data?.sender == selectedUser?._id) {
        const res = await markChatAsRead(data?._id)
        if (res?.success) {
          setChats(prevChats => [...prevChats, data]);
          client.emit("reduceChatCount", 1)
          client.emit("reduceUserCount", data)

        }
      }
    };

    client.on('recMessage', handleMessage);

    return () => {
      client.off('recMessage', handleMessage);
    };
  }, [client, selectedUser]);


  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        setChats([]);
        const res = await getMessages(selectedUser._id);
        if (res.success) {
          setChats(res.data);
          const newReadCount = res.data.filter(chat => chat?.status === 'unread');
          client.emit("reduceChatCount", newReadCount?.length)
          client.emit("reduceUserCount", selectedUser)

        }
      } catch (err) {
        console.error('Error fetching private messages:', err);
      }
    };

    fetchMessages();
  }, [selectedUser, projectId]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const res = await sendMessage(selectedUser._id, message, projectId);
    if (res.success) {
      setMessage('');

      setChats(prevChats => [...prevChats, res.data]);
      client.emit('sendMess', res.data);
    }

  };

  return (
    <>
      <FlashMsg message={flashMsg} setMessage={() => setFlashMsg('')} />
      {confirmMakeCall && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white text-center">Start Video Call?</h2>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setConfirmMakeCall(false)}
                className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  client.emit('call-user', {
                    user: userData,
                    targetUserId: selectedUser._id,
                    callerId: userData._id,
                    roomId: `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    projectId
                  });
                  setConfirmMakeCall(false);
                }}
                className="px-6 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black text-lg font-medium"
              >
                Make Call
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        {!selectedUser ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xl">
            Welcome to Chat
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                Chat with {selectedUser.name}
              </h2>
              <button
                onClick={getMediaPermission}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-black text-lg font-semibold"
              >
                Video Call
              </button>
            </div>

            <div className="flex-1 bg-gray-800 rounded-2xl p-6 overflow-y-auto text-gray-300 space-y-4">
              {chats.length === 0 ? (
                <p className="text-center text-gray-500 italic">No messages yet...</p>
              ) : (
                chats.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.sender?.toString() === userData._id?.toString()
                      ? 'justify-end'
                      : 'justify-start'
                      }`}
                  >
                    <div
                      className={`px-5 py-3 rounded-2xl max-w-sm ${chat.sender === userData._id
                        ? 'bg-gray-700 text-white'
                        : 'bg-teal-500 text-black'
                        }`}
                    >
                      {chat.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-6 flex">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {

                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-5 py-3 bg-gray-700 border border-gray-600 rounded-l-2xl focus:outline-none text-white text-lg"
              />

              <button

                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`px-6 py-3 ${message.trim()
                  ? 'bg-teal-500 hover:bg-teal-400 cursor-pointer'
                  : 'bg-gray-600 cursor-not-allowed'
                  } text-black font-semibold text-lg rounded-r-2xl`}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default ChatArea;
