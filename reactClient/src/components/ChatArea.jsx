import React, { useEffect, useState } from 'react';
import { getMessages, sendMessage } from '../services/chatService';
import useSocket from '../provider/SocketProvider';

function ChatArea({ selectedUser }) {
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');

  const { client } = useSocket()


  console.log(client);
  



  useEffect(() => {
    const fetchMessages = async () => {
      setChats([])
      const res = await getMessages(selectedUser._id);
      console.log(res);

      if (res.success) {
        setChats(res.data);
      } else {
        console.error('Failed to fetch messages:', res.message);
      }
    };

    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  const handleSendMessage = async () => {
    const res = await sendMessage(selectedUser._id, message);
    console.log(res);

    if (res.success) {
      setMessage('');
      setChats([...chats, res.data]);
      console.log('Message sent successfully:', res);
    }
  };

  return (
    <main className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-6">
      {!selectedUser ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          Select a user to start chatting...
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Chat header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Chat with {selectedUser.name}</h2>
          </div>

          {/* Messages section */}
          <div className="flex-1 bg-gray-800 rounded-xl p-4 overflow-y-auto text-gray-300 space-y-2">
            {chats.length === 0 ? (
              <p className="text-sm italic text-center">No messages yet...</p>
            ) : (
              chats.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${chat.sender === selectedUser._id ? 'justify-start' : 'justify-end'
                    }`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs ${chat.sender === selectedUser._id
                      ? 'bg-gray-700 text-white'
                      : 'bg-teal-500 text-black'
                      }`}
                  >
                    {chat.message}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message input */}
          <div className="mt-4 flex">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-xl focus:outline-none text-white"
            />
            <button
              className={`px-4 py-2 ${message.trim()
                ? 'bg-teal-500 hover:bg-teal-400 cursor-pointer'
                : 'bg-gray-600 cursor-not-allowed'
                } text-black font-semibold rounded-r-xl`}
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ChatArea;
