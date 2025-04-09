import React, { useEffect, useState } from 'react';
import useSocket from '../provider/SocketProvider';
import { getProjectMembers } from '../services/projectService';
import { useParams } from 'react-router-dom';
import ChatArea from './ChatArea';

function Chat() {
  const { projectId } = useParams();
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { client } = useSocket();

  useEffect(() => {
    if (client) {
      client.on('connect', () => console.log('Connected to the server!'));
    }
  }, [client]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getProjectMembers(projectId);
      if (res.success) {
        setAllUsers(res.data);
      } else {
        console.error('Failed to fetch users:', res.message);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white p-4">
      <aside className="w-1/4 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-4 mr-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">💬 Users</h2>
        <div className="space-y-2">
          {allUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 rounded-xl border border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors duration-200 ${
                selectedUser?._id === user._id ? 'bg-gray-800' : 'bg-gray-900'
              }`}
              style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} // fallback for extreme cases
            >
              <p className="font-medium break-words whitespace-normal w-full">
                {user.name}
              </p>
            </div>
          ))}
        </div>
      </aside>

      <ChatArea selectedUser={selectedUser}/>
    </div>
  );
}

export default Chat;
