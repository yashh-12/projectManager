import React, { useEffect, useState } from 'react';
import useSocket from '../provider/SocketProvider';
import { getProjectMembers } from '../services/projectService';
import { useParams } from 'react-router-dom';
import ChatArea from './ChatArea';

function Chat() {
  const { projectId } = useParams();
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { client } = useSocket()
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getProjectMembers(projectId);
      console.log(res);

      if (res.success) {
        setAllUsers(res.data);
      } else {
        console.error('Failed to fetch users:', res.message);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {

    if (!client) return;


    const handler = (data) => {
      if (data.sender) {

        console.log("wg ");

        setAllUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === data.sender ? { ...user, unreadCount: 0 } : user
          )
        );

      } else {

        console.log("per ", data);
        setAllUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === data._id ? { ...user, unreadCount: 0 } : user
          )
        );

      }
    };

    client.on("minusUserCount", handler);

    client.on("recMessage", data => {

      console.log("rannnn ");

      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === data.sender ? { ...user, unreadCount: user.unreadCount + 1 } : user
        )
      );

    })

    return () => {
      client.off("minusUserCount", handler);
    };
  }, [client]);


  return (
    <div className="flex h-screen bg-gray-900 text-white p-4">
      <aside className="w-1/4 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-4 mr-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">💬 Users </h2>
        <div className="space-y-2">


          {allUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 rounded-xl border border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors duration-200 ${selectedUser?._id === user._id ? 'bg-gray-800' : 'bg-gray-900'
                }`}
              style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium break-words whitespace-normal w-full">
                  {user.name}
                </p>
                {user.unreadCount > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {user.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}

        </div>
      </aside>

      <ChatArea selectedUser={selectedUser} />
    </div>
  );

}

export default Chat;
