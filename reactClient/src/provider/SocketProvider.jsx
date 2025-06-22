// src/provider/SocketProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const userData = useSelector(state => state?.auth?.userData);

  useEffect(() => {
    if (!userData?._id) return;

    const newSocket = io('http://localhost:3000', {
      query: { userId: userData._id },
      transports: ['websocket'],
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server ",newSocket.id);
      newSocket.emit("register", userData._id);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log(" Socket cleaned up");
    };
  }, [userData]);

  return (
    <SocketContext.Provider value={{ client: socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default function useSocket() {
  return useContext(SocketContext);
}
